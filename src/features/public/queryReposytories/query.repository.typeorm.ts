import { IQueryRepository } from './i.query.repository';
import {
  AllCommentsForAllPostsCurrentUserBlogs,
  BanUsersInfoForBlog,
  BlogsQueryType,
  BlogsQueryTypeSA,
  CommentsType,
  PostQueryType,
  UserQueryType,
} from '../../../common/helper/allTypes';

export class QueryRepositoryTypeorm extends IQueryRepository {
  async getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
    ownerId: string,
  ): Promise<BanUsersInfoForBlog> {
    return Promise.resolve(undefined);
  }

  async getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs> {
    return Promise.resolve(undefined);
  }

  async getQueryAllUsers(query: any): Promise<UserQueryType> {
    return Promise.resolve(undefined);
  }

  async getQueryBlogs(query: any): Promise<BlogsQueryType> {
    return Promise.resolve(undefined);
  }

  async getQueryBlogsAuthUser(
    query: any,
    userId: string,
  ): Promise<BlogsQueryType> {
    return Promise.resolve(undefined);
  }

  async getQueryBlogsSA(query: any): Promise<BlogsQueryTypeSA> {
    return Promise.resolve(undefined);
  }

  async getQueryCommentsByPostId(
    query: any,
    postId: string,
    userId: string,
  ): Promise<CommentsType | boolean> {
    return Promise.resolve(undefined);
  }

  async getQueryPosts(query: any, userId: string): Promise<PostQueryType> {
    return Promise.resolve(undefined);
  }

  async getQueryPostsBlogsId(
    query: any,
    blogId: string,
    userId: string,
  ): Promise<PostQueryType> {
    return Promise.resolve(undefined);
  }

  async getQuerySortUsers(query: any): Promise<UserQueryType> {
    return Promise.resolve(undefined);
  }

  async returnObject(query, totalCount, sortArrayUsers) {}
}
