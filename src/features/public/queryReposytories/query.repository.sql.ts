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
import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryRepositorySql extends IQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly queryCount: QueryCount,
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
              isBanned: banInfo?.isBanned || false,
              banDate: banInfo?.banDate || null,
              banReason: banInfo?.banReason || null,
            },
          };
        }),
      ),
    };
  }

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
}
