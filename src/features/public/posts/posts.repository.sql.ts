import { Injectable } from '@nestjs/common';
import { IPostsRepository } from './i.posts.repository';
import { LikesModelDocument } from '../../../common/schemas/like.type.schema';
import { PostDocument } from './schema/posts.schema';

@Injectable()
export class PostsRepositorySql extends IPostsRepository {
  constructor() {
    super();
  }

  createLikeStatus(likeStatus: LikesModelDocument): Promise<boolean> {
    return Promise.resolve(false);
  }

  deletePostId(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getAllInfoLike(postId: string): Promise<LikesModelDocument[]> {
    return Promise.resolve([]);
  }

  getDislikeInfo(idPost: string): Promise<number | undefined> {
    return Promise.resolve(undefined);
  }

  getInfoStatusByPost(idPost: string, userId: string) {}

  getLikesInfo(idPost: string): Promise<number> {
    return Promise.resolve(0);
  }

  getMyStatus(userId: string, postId: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  getPostId(id: string): Promise<PostDocument | null> {
    return Promise.resolve(undefined);
  }

  save(post: PostDocument) {}

  updateStatusPost(
    idPost: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }
}
