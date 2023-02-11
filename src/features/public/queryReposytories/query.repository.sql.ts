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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryCount } from '../../../common/helper/query.count';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICommentsRepository } from '../comments/i.comments.repository';

@Injectable()
export class QueryRepositorySql extends IQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly queryCount: QueryCount,
    private readonly commentsRepository: ICommentsRepository,
  ) {
    super();
  }

  async getQueryAllUsers(query: any): Promise<UserQueryType> {
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Users"
       WHERE "login" ILIKE $1
       OR "email" ILIKE $2`,
      [`%${query.searchLoginTerm}%`, `%${query.searchEmailTerm}%`],
    );
    const sortArrayUsers = await this.dataSource.query(
      `SELECT * FROM public."Users"
            WHERE "login" ILIKE $1
            OR "email" ILIKE $2
            ORDER BY "${query.sortBy}" ${query.sortDirection}
            LIMIT $3 OFFSET $4`,
      [
        `%${query.searchLoginTerm}%`,
        `%${query.searchEmailTerm}%`,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    return this.returnObject(query, totalCount[0], sortArrayUsers);
  }

  async getQuerySortUsers(query: any): Promise<UserQueryType> {
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Users"
            WHERE ("login" ILIKE $1
            OR "email" ILIKE $2)
            AND "ban"= $3`,
      [
        `%${query.searchLoginTerm}%`,
        `%${query.searchEmailTerm}%`,
        query.banStatus === 'banned',
      ],
    );
    const sortArrayUsers = await this.dataSource.query(
      `SELECT * FROM public."Users"
            WHERE ("login" ILIKE $1
            OR "email" ILIKE $2)
            AND "ban"=$5
            ORDER BY "${query.sortBy}" ${query.sortDirection}
            LIMIT $3 OFFSET $4`,
      [
        `%${query.searchLoginTerm}%`,
        `%${query.searchEmailTerm}%`,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
        query.banStatus === 'banned',
      ],
    );
    return this.returnObject(query, totalCount[0], sortArrayUsers);
  }

  async returnObject(query, totalCount, sortArrayUsers) {
    return {
      pagesCount: this.queryCount.pagesCountHelper(
        totalCount.count,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount.count,
      items: await Promise.all(
        sortArrayUsers.map(async (a) => {
          const banInfo = await this.dataSource.query(
            `SELECT * FROM public."BanUsers"
                   WHERE "userId"=$1`,
            [a.id],
          );
          return {
            id: a.id,
            login: a.login,
            email: a.email,
            createdAt: a.createdAt,
            banInfo: {
              isBanned: banInfo[0]?.isBanned || false,
              banDate: banInfo[0]?.banDate || null,
              banReason: banInfo[0]?.banReason || null,
            },
          };
        }),
      ),
    };
  }

  async getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
    ownerId: string,
  ): Promise<BanUsersInfoForBlog> {
    const blog = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
            WHERE "id"=$1`,
      [blogId],
    );
    if (!blog[0]) throw new NotFoundException();
    if (blog[0].userId !== ownerId) throw new ForbiddenException();
    const banUsers = await this.dataSource.query(
      `SELECT * FROM public."BanUsers"
            WHERE "blogId"=$1`,
      [blog[0].id],
    );
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Users"
            WHERE "id" IN $1 AND "login"=$2`,
      [
        banUsers.map((a) => {
          return a.userId;
        }),
        `%${query.searchLoginTerm}%`,
      ],
    );
    const banUsersArraySort = await this.dataSource.query(
      `SELECT * FROM public."Users"
            WHERE "id" IN $1 AND "login"=$2
            ORDER BY "${query.sortBy}" ${query.sortDirection}
            LIMIT $3 OFFSET $4`,
      [
        banUsers.map((a) => {
          return a.userId;
        }),
        `%${query.searchLoginTerm}%`,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    return {
      pagesCount: this.queryCount.pagesCountHelper(
        totalCount[0].count,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount[0].count,
      items: banUsersArraySort.map((a) => {
        const banInfo = banUsers.find((b) => a.id === b.userId);
        return {
          id: a.id,
          login: a.login,
          banInfo: {
            isBanned: banInfo.isBanned,
            banDate: banInfo.banDate,
            banReason: banInfo.banReason,
          },
        };
      }),
    };
  }

  async getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs> {
    const arrayPosts = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
            WHERE "userId"=$1`,
      [userId],
    );
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Comments"
            WHERE "idPost"=$1`,
      [
        arrayPosts.map((a) => {
          return a.id;
        }),
      ],
    );
    const sortArrayComments = await this.dataSource.query(
      `SELECT * FROM public."Comments"
            WHERE "idPost"=$1
            ORDER BY "${query.sortBy}" ${query.sortDirection}
            LIMIT $2 OFFSET $3`,
      [
        arrayPosts.map((a) => {
          return a.id;
        }),
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    return {
      pagesCount: this.queryCount.pagesCountHelper(
        totalCount.count,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        sortArrayComments.map(async (a) => {
          const comment = arrayPosts.find((b) => a.idPost === b.id);
          const likeInfo = await this.commentsRepository.getLikesInfo(a.userId);
          const dislikeInfo = await this.commentsRepository.getDislikeInfo(
            a.userId,
          );
          const myStatus = await this.commentsRepository.getMyStatus(
            a.userId,
            a.id,
          );
          return {
            id: a.id,
            content: a.content,
            commentatorInfo: {
              userId: a.userId,
              userLogin: a.userLogin,
            },
            createdAt: a.createdAt,
            postInfo: {
              id: comment.id,
              title: comment.title,
              blogId: comment.blogId,
              blogName: comment.blogName,
            },
            likesInfo: {
              likesCount: likeInfo,
              dislikesCount: dislikeInfo,
              myStatus: myStatus,
            },
          };
        }),
      ),
    };
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
}
