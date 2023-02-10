import { CommentDocument } from './schema/comment.schema';
import { LikesModel } from '../../../common/schemas/like.type.schema';

export abstract class ICommentsRepository {
  abstract getCommentById(id: string): Promise<CommentDocument | null>;
  abstract deleteCommentById(id: string): Promise<boolean>;
  abstract getLikesInfo(idComment: string): Promise<number>;
  abstract getDislikeInfo(idComment: string): Promise<number | undefined>;
  abstract getMyStatus(
    userId: string,
    commentId: string,
  ): Promise<string | undefined>;
  abstract setLikeStatus(likeInfo: LikesModel): Promise<boolean>;
  abstract getInfoStatusByComment(idComment: string, userId: string);
  abstract updateStatusComment(
    idComment: string,
    userId: string,
    status: string,
  ): Promise<boolean>;
  abstract save(comment: CommentDocument);
}
