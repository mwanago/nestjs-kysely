export interface ArticleModelData {
  id: number;
  title: string;
  paragraphs: string[];
  author_id: number;
  scheduled_date?: Date;
}

export class Article {
  id: number;
  title: string;
  paragraphs: string[];
  authorId: number;
  scheduledDate?: Date;
  constructor({
    id,
    title,
    paragraphs,
    author_id,
    scheduled_date,
  }: ArticleModelData) {
    this.id = id;
    this.title = title;
    this.paragraphs = paragraphs;
    this.authorId = author_id;
    if (scheduled_date) {
      this.scheduledDate = scheduled_date;
    }
  }
}
