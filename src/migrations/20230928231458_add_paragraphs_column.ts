import { Migration, sql } from 'kysely';

export const up: Migration['up'] = async (database) => {
  await database.schema
    .alterTable('articles')
    .addColumn('paragraphs', sql`text[]`)
    .execute();

  await database
    .updateTable('articles')
    .set({
      paragraphs: sql`ARRAY[article_content]`,
    })
    .execute();

  await database.schema
    .alterTable('articles')
    .dropColumn('article_content')
    .execute();

  await database.schema
    .alterTable('articles')
    .alterColumn('paragraphs', (column) => {
      return column.setNotNull();
    })
    .execute();
};

export const down: Migration['down'] = async (database) => {
  await database.schema
    .alterTable('articles')
    .dropColumn('paragraphs')
    .addColumn('article_content', 'text', (column) => column.notNull());
};
