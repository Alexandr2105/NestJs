import { PostDocument } from './schema/posts.schema';
import { LikesModelDocument } from '../../../common/schemas/like.type.schema';
import { ImageModelDocument } from '../../../common/schemas/image.schema';

export abstract class IPostsRepository {
  abstract getPostId(id: string);
  abstract deletePostId(id: string);
  abstract createLikeStatus(likeStatus: LikesModelDocument);
  abstract getLikesInfo(idPost: string);
  abstract getDislikeInfo(idPost: string);
  abstract getMyStatus(userId: string, postId: string);
  abstract getAllInfoLike(postId: string);
  abstract getInfoStatusByPost(idPost: string, userId: string);
  abstract updateStatusPost(
    idPost: string,
    userId: string,
    status: string,
  ): Promise<boolean>;
  abstract save(post: PostDocument);
  abstract saveImage(image: ImageModelDocument);
  abstract getInfoForImage(url: string);
}
