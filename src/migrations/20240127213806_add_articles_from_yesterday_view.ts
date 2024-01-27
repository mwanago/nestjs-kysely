import { Migration, sql } from 'kysely';

export const up: Migration['up'] = async (database) => {
  await database.schema
    .createView('articles_from_yesterday')
    .as(
      database
        .selectFrom('articles')
        .selectAll()
        .where('created_at', '<', sql`NOW() - INTERVAL '1 DAY'`)
        .where('created_at', '>', sql`NOW() - INTERVAL '2 DAYS'`),
    )
    .materialized()
    .execute();
};

export const down: Migration['down'] = async (database) => {
  await database.schema.dropView('articles_from_yesterday');
};
