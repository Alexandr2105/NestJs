import { CommentDocument } from './schema/comment.schema';
import { LikesModel } from '../../../common/schemas/like.type.schema';

export abstract class ICommentsRepository {
  abstract getCommentById(id: string);
  abstract deleteCommentById(id: string);
  abstract getLikesInfo(idComment: string);
  abstract getDislikeInfo(idComment: string);
  abstract getMyStatus(userId: string, commentId: string);
  abstract setLikeStatus(likeInfo: LikesModel);
  abstract getInfoStatusByComment(idComment: string, userId: string);
  abstract updateStatusComment(
    idComment: string,
    userId: string,
    status: string,
  ): Promise<boolean>;
  abstract save(comment: CommentDocument);
}
