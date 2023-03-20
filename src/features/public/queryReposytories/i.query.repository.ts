export abstract class IQueryRepository {
  abstract getQueryAllUsers(query: any);
  abstract getQuerySortUsers(query: any);
  abstract returnObject(query, totalCount, sortArrayUsers);
  abstract getQueryBlogs(query: any);
  abstract getQueryPosts(query: any, userId: string);
  abstract getQueryPostsBlogsId(query: any, blogId: string, userId: string);
  abstract getQueryCommentsByPostId(query: any, postId: string, userId: string);
  abstract getQueryBlogsAuthUser(query: any, userId: string);
  abstract getQueryBlogsSA(query: any);
  abstract getQueryAllInfoForBlog(query: any, userId: string);
  abstract getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
    ownerId: string,
  );
  abstract getQueryAllQuestionSa(query: any);
  abstract getQueryAllQuestionSaSortStatus(query: any);
  abstract getQueryAllMyGames(query: any, id: string);
}
