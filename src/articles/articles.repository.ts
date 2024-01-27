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
import { PostgresErrorCode } from '../database/postgresErrorCode.enum';
import { getDifferenceBetweenArrays } from '../utils/getDifferenceBetweenArrays';
import { isDatabaseError } from '../types/databaseError';

@Injectable()
export class ArticlesRepository {
  constructor(private readonly database: Database) {}

  async getArticlesFromYesterday() {
    const databaseResponse = await this.database
      .selectFrom('articles_from_yesterday')
      .selectAll()
      .execute();

    return databaseResponse.map((articleData) => new Article(articleData));
  }

  async getAll(offset: number, limit: number | null, idsToSkip: number) {
    const { data, count } = await this.database
      .transaction()
      .execute(async (transaction) => {
        let articlesQuery = transaction
          .selectFrom('articles')
          .where('id', '>', idsToSkip)
          .orderBy('id')
          .offset(offset)
          .selectAll();

        if (limit !== null) {
          articlesQuery = articlesQuery.limit(limit);
        }

        const articlesResponse = await articlesQuery.execute();

        const { count } = await transaction
          .selectFrom('articles')
          .select((expressionBuilder) => {
            return expressionBuilder.fn.countAll().as('count');
          })
          .executeTakeFirstOrThrow();

        return {
          data: articlesResponse,
          count,
        };
      });

    const items = data.map((articleData) => new Article(articleData));

    return {
      items,
      count,
    };
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
        'articles.paragraphs as paragraphs',
        'articles.title as title',
        'articles.author_id as author_id',
        'articles.scheduled_date as scheduled_date',
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

  async getByAuthorId(
    authorId: number,
    offset: number,
    limit: number | null,
    idsToSkip: number,
  ) {
    const { data, count } = await this.database
      .transaction()
      .execute(async (transaction) => {
        let articlesQuery = transaction
          .selectFrom('articles')
          .where('author_id', '=', authorId)
          .where('id', '>', idsToSkip)
          .orderBy('id')
          .offset(offset)
          .selectAll();

        if (limit !== null) {
          articlesQuery = articlesQuery.limit(limit);
        }

        const articlesResponse = await articlesQuery.execute();

        const { count } = await transaction
          .selectFrom('articles')
          .where('author_id', '=', authorId)
          .select((expressionBuilder) => {
            return expressionBuilder.fn.countAll().as('count');
          })
          .executeTakeFirstOrThrow();

        return {
          data: articlesResponse,
          count,
        };
      });

    const items = data.map((articleData) => new Article(articleData));

    return {
      items,
      count,
    };
  }

  async create(data: ArticleDto, authorId: number) {
    try {
      const databaseResponse = await this.database
        .insertInto('articles')
        .values({
          title: data.title,
          paragraphs: data.paragraphs,
          author_id: authorId,
          scheduled_date: data.scheduledDate,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return new Article(databaseResponse);
    } catch (error) {
      if (!isDatabaseError(error)) {
        throw error;
      }
      if (error.code === PostgresErrorCode.CheckViolation) {
        throw new BadRequestException(
          'The length of the content needs to be greater than 0',
        );
      }
      if (error.code === PostgresErrorCode.NotNullViolation) {
        throw new BadRequestException(
          `A null value can't be set for the ${error.column} column`,
        );
      }
      throw error;
    }
  }

  async createWithCategories(data: ArticleDto, authorId: number) {
    try {
      const databaseResponse = await this.database
        .transaction()
        .execute(async (transaction) => {
          const createdArticleResponse = await transaction
            .insertInto('articles')
            .values({
              title: data.title,
              paragraphs: data.paragraphs,
              author_id: authorId,
              scheduled_date: data.scheduledDate,
            })
            .returning(['id', 'title', 'paragraphs', 'author_id'])
            .executeTakeFirstOrThrow();

          if (!data.categoryIds) {
            return createdArticleResponse;
          }

          await transaction
            .insertInto('categories_articles')
            .values(
              data.categoryIds.map((categoryId) => ({
                article_id: createdArticleResponse.id,
                category_id: categoryId,
              })),
            )
            .execute();

          return createdArticleResponse;
        });

      return new ArticleWithCategoryIds({
        ...databaseResponse,
        category_ids: data.categoryIds,
      });
    } catch (error) {
      if (!isDatabaseError(error)) {
        throw error;
      }
      if (error.code === PostgresErrorCode.CheckViolation) {
        throw new BadRequestException(
          'The length of the content needs to be greater than 0',
        );
      }
      if (error.code === PostgresErrorCode.NotNullViolation) {
        throw new BadRequestException(
          `A null value can't be set for the ${error.column} column`,
        );
      }
      if (error.code === PostgresErrorCode.ForeignKeyViolation) {
        throw new BadRequestException('Category not found');
      }
      throw error;
    }
  }

  async update(id: number, data: ArticleDto) {
    const databaseResponse = await this.database
      .transaction()
      .execute(async (transaction) => {
        const updateArticleResponse = await transaction
          .updateTable('articles')
          .set({
            title: data.title,
            paragraphs: data.paragraphs,
            scheduled_date: data.scheduledDate,
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
        isDatabaseError(error) &&
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
