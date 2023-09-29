export interface ArticleModelData {
  id: number;
  title: string;
  paragraphs: string[];
  author_id: number;
}

export class Article {
  id: number;
  title: string;
  paragraphs: string[];
  authorId: number;
  constructor({ id, title, paragraphs, author_id }: ArticleModelData) {
    this.id = id;
    this.title = title;
    this.paragraphs = paragraphs;
    this.authorId = author_id;
  }
}
