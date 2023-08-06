import { Generated } from 'kysely';

export interface ArticlesTable {
  id: Generated<number>;
  title: string;
  article_content: string;
}
