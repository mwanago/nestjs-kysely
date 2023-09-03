import { ArticlesTable } from '../articles/articlesTable';
import { Kysely } from 'kysely';
import { UsersTable } from '../users/usersTable';
import { AddressesTable } from '../users/addressesTable';
import { CategoriesTable } from '../categories/categoriesTable';
import { CategoriesArticlesTable } from '../categories/categoriesArticlesTable';

export interface Tables {
  articles: ArticlesTable;
  users: UsersTable;
  addresses: AddressesTable;
  categories: CategoriesTable;
  categories_articles: CategoriesArticlesTable;
}

export class Database extends Kysely<Tables> {}
