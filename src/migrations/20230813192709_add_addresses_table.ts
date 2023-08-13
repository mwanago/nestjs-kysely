import { Kysely } from 'kysely';

export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .createTable('addresses')
    .addColumn('id', 'serial', (column) => {
      return column.primaryKey();
    })
    .addColumn('street', 'text')
    .addColumn('city', 'text')
    .addColumn('country', 'text')
    .execute();

  await database.schema
    .alterTable('users')
    .addColumn('address_id', 'integer', (column) => {
      return column.unique().references('addresses.id');
    })
    .execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.dropTable('country').execute();
  await database.schema.alterTable('users').dropColumn('address_id');
}
