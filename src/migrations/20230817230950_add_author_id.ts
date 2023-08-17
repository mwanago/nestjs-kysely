import { Kysely, Migration } from 'kysely';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../types/environmentVariables';

config();

const configService = new ConfigService<EnvironmentVariables>();

export const up: Migration['up'] = async (database) => {
  const email = configService.get('ADMIN_EMAIL');

  const adminDatabaseResponse = await database
    .selectFrom('users')
    .where('email', '=', email)
    .selectAll()
    .executeTakeFirstOrThrow();

  const adminId = adminDatabaseResponse.id;

  await database.schema
    .alterTable('articles')
    .addColumn('author_id', 'integer', (column) => {
      return column.references('users.id');
    })
    .execute();

  await database
    .updateTable('articles')
    .set({
      author_id: adminId,
    })
    .execute();

  await database.schema
    .alterTable('articles')
    .alterColumn('author_id', (column) => {
      return column.setNotNull();
    })
    .execute();
};

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .alterTable('articles')
    .dropColumn('author_id')
    .execute();
}
