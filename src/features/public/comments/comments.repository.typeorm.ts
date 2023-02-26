import { ICommentsRepository } from './i.comments.repository';
import { LikesModel } from '../../../common/schemas/like.type.schema';
import { CommentDocument } from './schema/comment.schema';

export class CommentsRepositoryTypeorm extends ICommentsRepository {
  async deleteCommentById(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  async getCommentById(id: string): Promise<CommentDocument | null> {
    return Promise.resolve(undefined);
  }

  async getDislikeInfo(idComment: string): Promise<number | undefined> {
    return Promise.resolve(undefined);
  }

  async getInfoStatusByComment(idComment: string, userId: string) {}

  async getLikesInfo(idComment: string): Promise<number> {
    return Promise.resolve(0);
  }

  async getMyStatus(
    userId: string,
    commentId: string,
  ): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  async save(comment: CommentDocument) {}

  async setLikeStatus(likeInfo: LikesModel): Promise<boolean> {
    return Promise.resolve(false);
  }

  async updateStatusComment(
    idComment: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }
}
