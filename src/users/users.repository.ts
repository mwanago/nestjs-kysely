import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { CreateUserDto } from './dto/createUser.dto';
import { Database } from '../database/database';

@Injectable()
export class UsersRepository {
  constructor(private readonly database: Database) {}

  async getByEmail(email: string) {
    const databaseResponse = await this.database
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();

    if (databaseResponse) {
      return new User(databaseResponse);
    }
  }

  async getById(id: number) {
    const databaseResponse = await this.database
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (databaseResponse) {
      return new User(databaseResponse);
    }
  }

  async create(userData: CreateUserDto) {
    const databaseResponse = await this.database
      .insertInto('users')
      .values({
        password: userData.password,
        email: userData.email,
        name: userData.name,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new User(databaseResponse);
  }
}
