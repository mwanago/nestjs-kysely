import { Kysely } from 'kysely';

export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .alterTable('articles')
    .addColumn('scheduled_date', 'timestamptz')
    .execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.alterTable('articles').dropColumn('scheduled_date');
}
