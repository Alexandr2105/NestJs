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
  getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
    ownerId: string,
  ): Promise<BanUsersInfoForBlog> {
    return Promise.resolve(undefined);
  }

  getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs> {
    return Promise.resolve(undefined);
  }

  getQueryAllUsers(query: any): Promise<UserQueryType> {
    return Promise.resolve(undefined);
  }

  getQueryBlogs(query: any): Promise<BlogsQueryType> {
    return Promise.resolve(undefined);
  }

  getQueryBlogsAuthUser(query: any, userId: string): Promise<BlogsQueryType> {
    return Promise.resolve(undefined);
  }

  getQueryBlogsSA(query: any): Promise<BlogsQueryTypeSA> {
    return Promise.resolve(undefined);
  }

  getQueryCommentsByPostId(
    query: any,
    postId: string,
    userId: string,
  ): Promise<CommentsType | boolean> {
    return Promise.resolve(undefined);
  }

  getQueryPosts(query: any, userId: string): Promise<PostQueryType> {
    return Promise.resolve(undefined);
  }

  getQueryPostsBlogsId(
    query: any,
    blogId: string,
    userId: string,
  ): Promise<PostQueryType> {
    return Promise.resolve(undefined);
  }

  getQuerySortUsers(query: any): Promise<UserQueryType> {
    return Promise.resolve(undefined);
  }

  returnObject(query, totalCount, sortArrayUsers) {}
}
