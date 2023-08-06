import { Database } from '../database/database';
import { Article } from './article.model';
import { Injectable } from '@nestjs/common';

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
}
