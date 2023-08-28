import { Database } from '../database/database';
import { Injectable } from '@nestjs/common';
import { Category } from './category.model';
import { CategoryDto } from './dto/category.dto';

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

    if (databaseResponse) {
      return new Category(databaseResponse);
    }
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

    if (databaseResponse) {
      return new Category(databaseResponse);
    }
  }

  async delete(id: number) {
    const databaseResponse = await this.database
      .deleteFrom('categories')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (databaseResponse) {
      return new Category(databaseResponse);
    }
  }
}
