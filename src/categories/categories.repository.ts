import { Database } from '../database/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './category.model';
import { CategoryDto } from './dto/category.dto';
import CategoryWithArticles from './categoryWithArticles.model';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly database: Database) {}

  async getAll() {
    const databaseResponse = await this.database
      .selectFrom('categories')
      .selectAll()
      .execute();
    return databaseResponse.map((categoryData) => new Category(categoryData));
  }

  async getById(id: number) {
    const databaseResponse = await this.database
      .selectFrom('categories')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (!databaseResponse) {
      throw new NotFoundException();
    }

    return new Category(databaseResponse);
  }

  async getWithArticles(categoryId: number) {
    const categoryResponse = await this.database
      .selectFrom('categories')
      .where('id', '=', categoryId)
      .selectAll()
      .executeTakeFirst();

    if (!categoryResponse) {
      throw new NotFoundException();
    }

    const articlesResponse = await this.database
      .selectFrom('categories_articles')
      .innerJoin('articles', 'articles.id', 'categories_articles.article_id')
      .where('category_id', '=', categoryId)
      .select([
        'articles.id as id',
        'articles.title as title',
        'articles.article_content as article_content',
        'articles.author_id as author_id',
      ])
      .execute();

    return new CategoryWithArticles({
      ...categoryResponse,
      articles: articlesResponse,
    });
  }

  async create(data: CategoryDto) {
    const databaseResponse = await this.database
      .insertInto('categories')
      .values({
        name: data.name,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Category(databaseResponse);
  }

  async update(id: number, data: CategoryDto) {
    const databaseResponse = await this.database
      .updateTable('categories')
      .set({
        name: data.name,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!databaseResponse) {
      throw new NotFoundException();
    }
    return new Category(databaseResponse);
  }

  async delete(id: number) {
    const databaseResponse = await this.database
      .transaction()
      .execute(async (transactionBuilder) => {
        await transactionBuilder
          .deleteFrom('categories_articles')
          .where('category_id', '=', id)
          .execute();

        const deleteCategoryResponse = await transactionBuilder
          .deleteFrom('categories')
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirst();

        if (!deleteCategoryResponse) {
          throw new NotFoundException();
        }
        return deleteCategoryResponse;
      });
    return new Category(databaseResponse);
  }
}
