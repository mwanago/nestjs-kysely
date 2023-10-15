import { ArticlesTable } from '../articles/articlesTable';
import { Kysely } from 'kysely';
import { UsersTable } from '../users/usersTable';
import { AddressesTable } from '../users/addressesTable';
import { CategoriesTable } from '../categories/categoriesTable';
import { CategoriesArticlesTable } from '../categories/categoriesArticlesTable';
import { CommentsTable } from '../comments/commentsTable';

export interface Tables {
  articles: ArticlesTable;
  users: UsersTable;
  addresses: AddressesTable;
  categories: CategoriesTable;
  categories_articles: CategoriesArticlesTable;
  comments: CommentsTable;
}

export class Database extends Kysely<Tables> {}
