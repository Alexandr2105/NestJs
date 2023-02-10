import { ICommentsRepository } from './i.comments.repository';
import { CommentDocument } from './schema/comment.schema';
import { LikesModel } from '../../../common/schemas/like.type.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsRepositorySql extends ICommentsRepository {
  constructor() {
    super();
  }

  deleteCommentById(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getCommentById(id: string): Promise<CommentDocument | null> {
    return Promise.resolve(undefined);
  }

  getDislikeInfo(idComment: string): Promise<number | undefined> {
    return Promise.resolve(undefined);
  }

  getInfoStatusByComment(idComment: string, userId: string) {}

  getLikesInfo(idComment: string): Promise<number> {
    return Promise.resolve(0);
  }

  getMyStatus(userId: string, commentId: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  save(comment: CommentDocument) {}

  setLikeStatus(likeInfo: LikesModel): Promise<boolean> {
    return Promise.resolve(false);
  }

  updateStatusComment(
    idComment: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }
}
