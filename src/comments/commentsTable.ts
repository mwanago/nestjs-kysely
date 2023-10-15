import { Generated } from 'kysely';

export interface CommentsTable {
  id: Generated<number>;
  content: string;
  author_id: number;
  article_id: number;
  deleted_at: Date | null;
}
