import { PostDocument } from './schema/posts.schema';
import { LikesModelDocument } from '../../../common/schemas/like.type.schema';

export abstract class IPostsRepository {
  abstract getPostId(id: string): Promise<PostDocument | null>;
  abstract deletePostId(id: string): Promise<boolean>;
  abstract createLikeStatus(likeStatus: LikesModelDocument): Promise<boolean>;
  abstract getLikesInfo(idPost: string): Promise<number>;
  abstract getDislikeInfo(idPost: string): Promise<number | undefined>;
  abstract getMyStatus(
    userId: string,
    postId: string,
  ): Promise<string | undefined>;
  abstract getAllInfoLike(postId: string): Promise<LikesModelDocument[]>;
  abstract getInfoStatusByPost(idPost: string, userId: string);
  abstract updateStatusPost(
    idPost: string,
    userId: string,
    status: string,
  ): Promise<boolean>;
  abstract save(post: PostDocument);
}
