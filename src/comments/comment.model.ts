export interface CommentModelData {
  id: number;
  content: string;
  author_id: number;
  article_id: number;
  deleted_at: Date | null;
}
export class Comment {
  id: number;
  content: string;
  authorId: number;
  articleId: number;
  deletedAt: Date | null;
  constructor(commentData: CommentModelData) {
    this.id = commentData.id;
    this.content = commentData.content;
    this.authorId = commentData.author_id;
    this.articleId = commentData.article_id;
    this.deletedAt = commentData.deleted_at;
  }
}
