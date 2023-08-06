import { ArticlesTable } from '../articles/articlesTable';
import { Kysely } from 'kysely';

interface Tables {
  articles: ArticlesTable;
}

export class Database extends Kysely<Tables> {}
