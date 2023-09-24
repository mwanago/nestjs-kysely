import { Kysely } from 'kysely';

export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .createIndex('article_author_id')
    .on('articles')
    .column('author_id')
    .execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.dropIndex('article_author_id').execute();
}
