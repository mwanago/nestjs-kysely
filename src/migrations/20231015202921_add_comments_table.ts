import { Kysely } from 'kysely';

export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .createTable('comments')
    .addColumn('id', 'serial', (column) => {
      return column.primaryKey();
    })
    .addColumn('content', 'text', (column) => {
      return column.notNull();
    })
    .addColumn('article_id', 'integer', (column) => {
      return column.references('articles.id');
    })
    .addColumn('author_id', 'integer', (column) => {
      return column.references('users.id');
    })
    .addColumn('deleted_at', 'timestamptz')
    .execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.dropTable('users').execute();
}
