import { IPostsRepository } from './i.posts.repository';
import { PostDocument } from './schema/posts.schema';
import { LikesModelDocument } from '../../../common/schemas/like.type.schema';

export class PostsRepositoryTypeorm extends IPostsRepository {
  async createLikeStatus(likeStatus: LikesModelDocument): Promise<boolean> {
    return Promise.resolve(false);
  }

  async deletePostId(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  async getAllInfoLike(postId: string): Promise<LikesModelDocument[]> {
    return Promise.resolve([]);
  }

  async getDislikeInfo(idPost: string): Promise<number | undefined> {
    return Promise.resolve(undefined);
  }

  async getInfoStatusByPost(idPost: string, userId: string) {}

  async getLikesInfo(idPost: string): Promise<number> {
    return Promise.resolve(0);
  }

  async getMyStatus(
    userId: string,
    postId: string,
  ): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  async getPostId(id: string): Promise<PostDocument | null> {
    return Promise.resolve(undefined);
  }

  async save(post: PostDocument) {}

  async updateStatusPost(
    idPost: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }
}
