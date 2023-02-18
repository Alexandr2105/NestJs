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
import { IPostsRepository } from '../posts/i.posts.repository';
import { IUsersRepository } from '../../sa/users/i.users.repository';

@Injectable()
export class QueryRepositorySql extends IQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly queryCount: QueryCount,
    private readonly commentsRepository: ICommentsRepository,
    private readonly postsRepository: IPostsRepository,
    private readonly usersRepository: IUsersRepository,
  ) {
    super();
  }

  async getQueryBlogs(query: any): Promise<BlogsQueryType> {
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Blogs"
            WHERE "name" ILIKE $1 AND "banStatus"=false`,
      [`%${query.searchNameTerm}%`],
    );
    const sortedBlogsArray = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
             WHERE "name" ILIKE $1 AND "banStatus"=false
             ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
             LIMIT $2 OFFSET $3`,
      [
        `%${query.searchNameTerm}%`,
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
      items: sortedBlogsArray.map((a) => {
        return {
          id: a.id,
          name: a.name,
          description: a.description,
          websiteUrl: a.websiteUrl,
          createdAt: a.createdAt,
          isMembership: a.isMembership,
        };
      }),
    };
  }

  async getQueryPosts(query: any, userId: string): Promise<PostQueryType> {
    const banUsers = await this.usersRepository.getBanUsers();
    const banBlogs = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
            WHERE "banStatus"=true`,
    );
    const sortPostsArray = await this.dataSource.query(
      `SELECT * FROM public."Posts"
            WHERE NOT "userId"= ANY ($1) AND NOT "blogId"=ANY($2)
            ORDER BY "${query.sortBy}" ${query.sortDirection}
            LIMIT $3 OFFSET $4`,
      [
        banUsers.map((a) => {
          return a.id;
        }),
        banBlogs.map((a) => {
          return a.id;
        }),
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Posts"
            WHERE NOT "userId"=ANY($1)`,
      [
        banUsers.map((a) => {
          return a.id;
        }),
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
      items: await Promise.all(
        sortPostsArray.map(async (a) => {
          const likeStatus = await this.postsRepository.getLikesInfo(a.id);
          const dislikeStatus = await this.postsRepository.getDislikeInfo(a.id);
          const myStatus = await this.postsRepository.getMyStatus(userId, a.id);
          const sortLikesArray = await this.dataSource.query(
            `SELECT * FROM public."LikesModel"
                    WHERE "id"=$1 AND "status"=$2
                   ORDER BY "createDate" COLLATE "C" DESC
                   LIMIT 3`,
            [a.id, 'Like'],
          );
          return {
            id: a.id,
            title: a.title,
            shortDescription: a.shortDescription,
            content: a.content,
            blogId: a.blogId,
            blogName: a.blogName,
            createdAt: a.createdAt,
            extendedLikesInfo: {
              likesCount: likeStatus,
              dislikesCount: dislikeStatus,
              myStatus: myStatus,
              newestLikes: sortLikesArray.map((b) => {
                return {
                  addedAt: b.createDate.toString(),
                  userId: b.userId,
                  login: b.login,
                };
              }),
            },
          };
        }),
      ),
    };
  }

  async getQueryPostsBlogsId(
    query: any,
    blogId: string,
    userId: string,
  ): Promise<PostQueryType> {
    const banUsers = await this.usersRepository.getBanUsers();
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Posts"
            WHERE "blogId"=$1 AND NOT "userId"=ANY($2)`,
      [
        blogId,
        banUsers.map((a) => {
          return a.id;
        }),
      ],
    );
    const sortPostsId = await this.dataSource.query(
      `SELECT * FROM public."Posts"
            WHERE "blogId"=$1 AND NOT "userId"=ANY($2)
            ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
            LIMIT $3 OFFSET $4`,
      [
        blogId,
        banUsers.map((a) => {
          return a.id;
        }),
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
      items: await Promise.all(
        sortPostsId.map(async (a) => {
          const likeInfo = await this.commentsRepository.getLikesInfo(a.id);
          const dislikeInfo = await this.commentsRepository.getDislikeInfo(
            a.id,
          );
          const myStatus = await this.commentsRepository.getMyStatus(
            userId,
            a.id,
          );
          const sortLikesArray = await this.dataSource.query(
            `SELECT * FROM public."LikesModel"
                    WHERE "id"=$1 AND "status"=$2
                   ORDER BY "createDate" DESC
                   LIMIT 3`,
            [a.id, 'Like'],
          );
          return {
            id: a.id,
            title: a.title,
            shortDescription: a.shortDescription,
            content: a.content,
            blogId: a.blogId,
            blogName: a.blogName,
            createdAt: a.createdAt,
            extendedLikesInfo: {
              likesCount: likeInfo,
              dislikesCount: dislikeInfo,
              myStatus: myStatus,
              newestLikes: sortLikesArray.map((a) => {
                return {
                  addedAt: a.createDate.toString(),
                  userId: a.userId,
                  login: a.login,
                };
              }),
            },
          };
        }),
      ),
    };
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
            ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
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
            ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
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

  async getQueryCommentsByPostId(
    query: any,
    postId: string,
    userId: string,
  ): Promise<CommentsType | boolean> {
    const banUsers = await this.usersRepository.getBanUsers();
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Comments"
            WHERE "idPost"=$1 AND NOT "userId" = ANY ($2)`,
      [
        postId,
        banUsers.map((a) => {
          return a.id;
        }),
      ],
    );
    const sortCommentsByPostId = await this.dataSource.query(
      `SELECT * FROM public."Comments"
            WHERE "idPost"=$1 AND NOT "userId"=ANY($2)
            ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
            LIMIT $3 OFFSET $4`,
      [
        postId,
        banUsers.map((a) => {
          return a.id;
        }),
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
      items: await Promise.all(
        sortCommentsByPostId.map(async (a) => {
          const likeInfo = await this.commentsRepository.getLikesInfo(a.id);
          const dislikeInfo = await this.commentsRepository.getDislikeInfo(
            a.id,
          );
          const myStatus = await this.commentsRepository.getMyStatus(
            userId,
            a.id,
          );
          return {
            id: a.id,
            content: a.content,
            commentatorInfo: { userId: a.userId, userLogin: a.userLogin },
            createdAt: a.createdAt,
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

  async getQueryBlogsAuthUser(
    query: any,
    userId: string,
  ): Promise<BlogsQueryType> {
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Blogs"
            WHERE "name" ILIKE $1 AND "userId"=$2`,
      [`%${query.searchNameTerm}%`, userId],
    );
    const sortedBlogsArray = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
             WHERE "name" ILIKE $1 AND "userId"=$2
             ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
             LIMIT $3 OFFSET $4`,
      [
        `%${query.searchNameTerm}%`,
        userId,
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
      items: sortedBlogsArray.map((a) => {
        return {
          id: a.id,
          name: a.name,
          description: a.description,
          websiteUrl: a.websiteUrl,
          createdAt: a.createdAt,
          isMembership: a.isMembership,
        };
      }),
    };
  }

  async getQueryBlogsSA(query: any): Promise<BlogsQueryTypeSA> {
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Blogs"
            WHERE "name" ILIKE $1`,
      [`%${query.searchNameTerm}%`],
    );
    const sortedBlogsArray = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
             WHERE "name" ILIKE $1
             ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
             LIMIT $2 OFFSET $3`,
      [
        `%${query.searchNameTerm}%`,
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
      items: await Promise.all(
        sortedBlogsArray.map(async (a) => {
          const user: any = await this.usersRepository.getUserId(a.userId);
          return {
            id: a.id,
            name: a.name,
            description: a.description,
            websiteUrl: a.websiteUrl,
            createdAt: a.createdAt,
            isMembership: a.isMembership,
            blogOwnerInfo: {
              userId: user.id,
              userLogin: user.login,
            },
            banInfo: { isBanned: a.banStatus, banDate: a.banDate || null },
          };
        }),
      ),
    };
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

  async getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs> {
    const arrayPosts = await this.dataSource.query(
      `SELECT * FROM public."Posts"
            WHERE "userId"=$1`,
      [userId],
    );
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Comments"
            WHERE "idPost" = ANY ($1)`,
      [
        arrayPosts.map((a) => {
          return a.id;
        }),
      ],
    );
    const sortArrayComments = await this.dataSource.query(
      `SELECT * FROM public."Comments"
            WHERE "idPost" = ANY ($1)
            ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
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
        totalCount[0].count,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount[0].count,
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
      `SELECT * FROM public."BanUsersForBlog"
            WHERE "blogId"=$1`,
      [blog[0].id],
    );
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Users"
            WHERE "id" = ANY ($1) AND "login" ILIKE $2`,
      [
        banUsers.map((a) => {
          return a.userId;
        }),
        `%${query.searchLoginTerm}%`,
      ],
    );
    const banUsersArraySort = await this.dataSource.query(
      `SELECT * FROM public."Users"
            WHERE "id" = ANY ($1) AND "login" ILIKE $2
            ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
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
}
