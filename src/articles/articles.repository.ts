import { Database } from '../database/database';
import { Article } from './article.model';
import { Injectable } from '@nestjs/common';
import { ArticleDto } from './dto/article.dto';
import { ArticleWithAuthorModel } from './articleWithAuthor.model';

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

  async getWithAuthor(id: number) {
    const databaseResponse = await this.database
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

    if (databaseResponse) {
      return new ArticleWithAuthorModel(databaseResponse);
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
  }

  async update(id: number, data: ArticleDto) {
    const databaseResponse = await this.database
      .updateTable('articles')
      .set({
        title: data.title,
        article_content: data.content,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (databaseResponse) {
      return new Article(databaseResponse);
    }
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
