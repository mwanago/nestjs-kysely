import { ArticlesTable } from '../articles/articlesTable';
import { Kysely } from 'kysely';
import { UsersTable } from '../users/usersTable';
import { AddressesTable } from '../users/addressesTable';

interface Tables {
  articles: ArticlesTable;
  users: UsersTable;
  addresses: AddressesTable;
}

export class Database extends Kysely<Tables> {}
