import { ArticlesTable } from '../articles/articlesTable';
import { Kysely } from 'kysely';
import { UsersTable } from '../users/articlesTable';

interface Tables {
  articles: ArticlesTable;
  users: UsersTable;
}

export class Database extends Kysely<Tables> {}
