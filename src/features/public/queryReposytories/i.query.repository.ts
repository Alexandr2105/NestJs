import {
  AllCommentsForAllPostsCurrentUserBlogs,
  BanUsersInfoForBlog,
  BlogsQueryType,
  BlogsQueryTypeSA,
  CommentsType,
  PostQueryType,
  UserQueryType,
} from '../../../common/helper/allTypes';

export abstract class IQueryRepository {
  abstract getQueryAllUsers(query: any): Promise<UserQueryType>;
  abstract getQuerySortUsers(query: any): Promise<UserQueryType>;
  abstract returnObject(query, totalCount, sortArrayUsers);
  abstract getQueryBlogs(query: any): Promise<BlogsQueryType>;
  abstract getQueryPosts(query: any, userId: string): Promise<PostQueryType>;
  abstract getQueryPostsBlogsId(
    query: any,
    blogId: string,
    userId: string,
  ): Promise<PostQueryType>;
  abstract getQueryCommentsByPostId(
    query: any,
    postId: string,
  ): Promise<CommentsType | boolean>;
  abstract getQueryBlogsAuthUser(
    query: any,
    userId: string,
  ): Promise<BlogsQueryType>;
  abstract getQueryBlogsSA(query: any): Promise<BlogsQueryTypeSA>;
  abstract getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs>;
  abstract getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
    ownerId: string,
  ): Promise<BanUsersInfoForBlog>;
}
