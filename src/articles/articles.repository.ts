import { Database, Tables } from '../database/database';
import { Article } from './article.model';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArticleDto } from './dto/article.dto';
import { sql, Transaction } from 'kysely';
import { ArticleWithCategoryIds } from './articleWithCategoryIds.model';
import { ArticleWithDetailsModel } from './articleWithDetails.model';
import { isRecord } from '../utils/isRecord';
import { PostgresErrorCode } from '../database/postgresErrorCode.enum';
import { getDifferenceBetweenArrays } from '../utils/getDifferenceBetweenArrays';
import { isDatabaseError } from '../types/databaseError';

@Injectable()
export class ArticlesRepository {
  constructor(private readonly database: Database) {}

  async getAll() {
    const databaseResponse = await this.database
      .selectFrom('articles')
      .selectAll()
      .execute();
    return databaseResponse.map((articleData) => new Article(articleData));
  }

  async getById(id: number) {
    const databaseResponse = await this.database
      .selectFrom('articles')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (databaseResponse) {
      return new Article(databaseResponse);
    }
  }

  async getWithDetails(id: number) {
    const articleResponse = await this.database
      .selectFrom('articles')
      .where('articles.id', '=', id)
      .innerJoin('users', 'users.id', 'articles.author_id')
      .leftJoin('addresses', 'addresses.id', 'users.address_id')
      .select([
        'articles.id as id',
        'articles.article_content as article_content',
        'articles.title as title',
        'articles.author_id as author_id',
        'users.id as user_id',
        'users.email as user_email',
        'users.name as user_name',
        'users.password as user_password',
        'addresses.id as address_id',
        'addresses.city as address_city',
        'addresses.street as address_street',
        'addresses.country as address_country',
      ])
      .executeTakeFirst();

    const categoryIdsResponse = await this.database
      .selectFrom('categories_articles')
      .where('article_id', '=', id)
      .selectAll()
      .execute();

    const categoryIds = categoryIdsResponse.map(
      (response) => response.category_id,
    );

    if (articleResponse) {
      return new ArticleWithDetailsModel({
        ...articleResponse,
        category_ids: categoryIds,
      });
    }
  }

  async getByAuthorId(authorId: number) {
    const databaseResponse = await this.database
      .selectFrom('articles')
      .where('author_id', '=', authorId)
      .selectAll()
      .execute();

    return databaseResponse.map((articleData) => new Article(articleData));
  }

  async create(data: ArticleDto, authorId: number) {
    try {
      const databaseResponse = await this.database
        .insertInto('articles')
        .values({
          title: data.title,
          article_content: data.content,
          author_id: authorId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return new Article(databaseResponse);
    } catch (error) {
      if (
        isDatabaseError(error) &&
        error.code === PostgresErrorCode.NotNullViolation
      ) {
        throw new BadRequestException(
          `A null value can't be set for the ${error.column} column`,
        );
      }
      throw error;
    }
  }

  async createWithCategories(data: ArticleDto, authorId: number) {
    const databaseResponse = await this.database
      .with('created_article', (database) => {
        return database
          .insertInto('articles')
          .values({
            title: data.title,
            article_content: data.content,
            author_id: authorId,
          })
          .returningAll();
      })
      .with('created_relationships', (database) => {
        return database
          .insertInto('categories_articles')
          .columns(['article_id', 'category_id'])
          .expression((expressionBuilder) => {
            return expressionBuilder
              .selectFrom('created_article')
              .select([
                'created_article.id as article_id',
                sql`unnest(${data.categoryIds}::int[])`.as('category_id'),
              ]);
          });
      })
      .selectFrom('created_article')
      .select(['id', 'title', 'article_content', 'author_id'])
      .executeTakeFirstOrThrow();

    return new ArticleWithCategoryIds({
      ...databaseResponse,
      category_ids: data.categoryIds,
    });
  }

  async update(id: number, data: ArticleDto) {
    const databaseResponse = await this.database
      .transaction()
      .execute(async (transaction) => {
        const updateArticleResponse = await transaction
          .updateTable('articles')
          .set({
            title: data.title,
            article_content: data.content,
          })
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirst();

        if (!updateArticleResponse) {
          throw new NotFoundException();
        }

        const newCategoryIds = data.categoryIds || [];

        const categoryIds = await this.updateCategoryIds(
          transaction,
          id,
          newCategoryIds,
        );

        return {
          ...updateArticleResponse,
          category_ids: categoryIds,
        };
      });

    return new ArticleWithCategoryIds(databaseResponse);
  }

  private async addCategoriesToArticle(
    transaction: Transaction<Tables>,
    articleId: number,
    categoryIdsToAdd: number[],
  ) {
    if (!categoryIdsToAdd.length) {
      return;
    }
    try {
      await transaction
        .insertInto('categories_articles')
        .values(
          categoryIdsToAdd.map((categoryId) => {
            return {
              article_id: articleId,
              category_id: categoryId,
            };
          }),
        )
        .execute();
    } catch (error) {
      if (
        isRecord(error) &&
        error.code === PostgresErrorCode.ForeignKeyViolation
      ) {
        throw new BadRequestException('Category not found');
      }
      throw error;
    }
  }

  private async removeCategoriesFromArticle(
    transaction: Transaction<Tables>,
    articleId: number,
    categoryIdsToRemove: number[],
  ) {
    if (!categoryIdsToRemove.length) {
      return;
    }
    return transaction
      .deleteFrom('categories_articles')
      .where((expressionBuilder) => {
        return expressionBuilder('article_id', '=', articleId).and(
          'category_id',
          '=',
          sql`ANY(${categoryIdsToRemove}::int[])`,
        );
      })
      .execute();
  }

  private async getCategoryIdsRelatedToArticle(
    transaction: Transaction<Tables>,
    articleId: number,
  ): Promise<number[]> {
    const categoryIdsResponse = await transaction
      .selectFrom('categories_articles')
      .where('article_id', '=', articleId)
      .selectAll()
      .execute();

    return categoryIdsResponse.map((response) => response.category_id);
  }

  private async updateCategoryIds(
    transaction: Transaction<Tables>,
    articleId: number,
    newCategoryIds: number[],
  ) {
    const existingCategoryIds = await this.getCategoryIdsRelatedToArticle(
      transaction,
      articleId,
    );

    const categoryIdsToRemove = getDifferenceBetweenArrays(
      existingCategoryIds,
      newCategoryIds,
    );

    const categoryIdsToAdd = getDifferenceBetweenArrays(
      newCategoryIds,
      existingCategoryIds,
    );

    await this.removeCategoriesFromArticle(
      transaction,
      articleId,
      categoryIdsToRemove,
    );
    await this.addCategoriesToArticle(transaction, articleId, categoryIdsToAdd);

    return this.getCategoryIdsRelatedToArticle(transaction, articleId);
  }

  async delete(id: number) {
    const databaseResponse = await this.database
      .deleteFrom('articles')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (databaseResponse) {
      return new Article(databaseResponse);
    }
  }
}
