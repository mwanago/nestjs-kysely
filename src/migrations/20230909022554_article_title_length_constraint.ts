import { Kysely, sql } from 'kysely';

export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .alterTable('articles')
    .addCheckConstraint(
      'article_title_length_constraint',
      sql`length(article_content) > 0`,
    )
    .execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .alterTable('articles')
    .dropConstraint('article_title_length_constraint')
    .execute();
}
