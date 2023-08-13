import { Kysely } from 'kysely';

export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .createTable('users')
    .addColumn('id', 'serial', (column) => {
      return column.primaryKey();
    })
    .addColumn('email', 'text', (column) => {
      return column.notNull().unique();
    })
    .addColumn('name', 'text', (column) => {
      return column.notNull();
    })
    .addColumn('password', 'text', (column) => {
      return column.notNull();
    })
    .execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.dropTable('users').execute();
}
