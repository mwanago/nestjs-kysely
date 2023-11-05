import { ColumnType, Generated } from 'kysely';

export interface ArticlesTable {
  id: Generated<number>;
  title: string;
  paragraphs: string[];
  author_id: number;
  scheduled_date?: ColumnType<Date, string | Date, string | Date>;
  created_at: Date;
}
