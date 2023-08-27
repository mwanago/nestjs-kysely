import { Kysely } from 'kysely';

export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .createTable('categories')
    .addColumn('id', 'serial', (column) => {
      return column.primaryKey();
    })
    .addColumn('name', 'text', (column) => column.notNull())
    .execute();

  await database.schema
    .createTable('categories_articles')
    .addColumn('category_id', 'integer', (column) => {
      return column.references('categories.id').notNull();
    })
    .addColumn('article_id', 'integer', (column) => {
      return column.references('articles.id').notNull();
    })
    .addPrimaryKeyConstraint('primary_key', ['category_id', 'article_id'])
    .execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.dropTable('categories').execute();
  await database.schema.dropTable('categories_articles').execute();
}
