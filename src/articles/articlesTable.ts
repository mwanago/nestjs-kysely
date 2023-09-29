import { Generated } from 'kysely';

export interface ArticlesTable {
  id: Generated<number>;
  title: string;
  paragraphs: string[];
  author_id: number;
}
