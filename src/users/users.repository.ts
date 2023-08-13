import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { CreateUserDto } from './dto/createUser.dto';
import { Database } from '../database/database';
import { expressionBuilder } from 'kysely';

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

  async createWithAddress(userData: CreateUserDto) {
    const databaseResponse = await this.database
      .with('created_address', (database) => {
        return database
          .insertInto('addresses')
          .values({
            street: userData.address?.street,
            city: userData.address?.city,
            country: userData.address?.country,
          })
          .returningAll();
      })
      .insertInto('users')
      .values((expressionBuilder) => {
        return {
          password: userData.password,
          email: userData.email,
          name: userData.name,
          address_id: expressionBuilder
            .selectFrom('created_address')
            .select('id'),
        };
      })
      .returning((expressionBuilder) => {
        return [
          'id',
          'email',
          'name',
          'password',
          'address_id',
          expressionBuilder
            .selectFrom('created_address')
            .select('street')
            .as('address_street'),
          expressionBuilder
            .selectFrom('created_address')
            .select('city')
            .as('address_city'),
          expressionBuilder
            .selectFrom('created_address')
            .select('country')
            .as('address_country'),
        ];
      })
      .executeTakeFirstOrThrow();

    return new User(databaseResponse);
  }
}
