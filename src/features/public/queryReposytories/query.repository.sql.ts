import { IQueryRepository } from './i.query.repository';
import {
  AllCommentsForAllPostsCurrentUserBlogs,
  AllMyGames,
  AllQuestionsSa,
  AllStatistics,
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
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ICommentsRepository } from '../comments/i.comments.repository';
import { IPostsRepository } from '../posts/i.posts.repository';
import { IUsersRepository } from '../../sa/users/i.users.repository';
import { PostsRepositorySql } from '../posts/posts.repository.sql';
import { IImageRepository } from '../imageRepository/i.image.repository';

@Injectable()
export class QueryRepositorySql extends IQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly queryCount: QueryCount,
    private readonly commentsRepository: ICommentsRepository,
    private readonly postsRepository: IPostsRepository,
    private readonly postsRepositorySql: PostsRepositorySql,
    private readonly usersRepository: IUsersRepository,
    private readonly imageRepository: IImageRepository,
  ) {
    super();
  }

  async getQueryBlogs(query: any, userId: string): Promise<BlogsQueryType> {
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."Blogs"
              WHERE "name" ILIKE $1 AND "banStatus"=false`,
      [`%${query.searchNameTerm}%`],
    );
    const sortedBlogsArray = await this.dataSource.query(
      `SELECT b.id,b.name,b.description,b."websiteUrl",b."createdAt",b."isMembership",
  w.url AS wallpaper_url, w.width AS wallpaper_width, w.height AS wallpaper_height, w."fileSize" AS wallpaper_fileSize,
    JSON_AGG(
    JSON_BUILD_OBJECT('url', m.url, 'width', m.width, 'height', m.height, 'fileSize', m."fileSize")
  ) AS main,
  s.status AS subscription_status,
  (SELECT COUNT(*) FROM public."SubscriptionsForBlog" WHERE "blogId" = b.id) AS subscribers_count
  FROM public."Blogs" b
  LEFT JOIN public."Image" w ON w."blogId"=b.id AND w."folderName"='wallpaper'
  LEFT JOIN public."Image" m ON m."blogId"=b.id AND m."folderName"='main'
  LEFT JOIN public."SubscriptionsForBlog" s ON s."blogId"=b.id AND s."userId"=$1
  WHERE "name" ILIKE $2 AND "banStatus"=false
  GROUP BY b.id, b.name, b.description, b."websiteUrl", b."createdAt", b."isMembership", w.url, w.width, w.height, w."fileSize", s.status
  ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
  LIMIT $3 OFFSET $4`,
      [
        userId,
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
          images: {
            wallpaper: a.wallpaper_url
              ? {
                  url: a.wallpaper_url,
                  width: a.wallpaper_width,
                  height: a.wallpaper_height,
                  fileSize: a.wallpaper_fileSize,
                }
              : null,
            main: a.main[0].url === null ? [] : a.main,
          },
          currentUserSubscriptionStatus:
            a.subscription_status === null ? 'None' : a.subscription_status,
          subscribersCount: +a.subscribers_count,
        };
      }),
    };
  }

  // async getQueryPosts(query: any, userId: string): Promise<PostQueryType> {
  //   const banUsers = await this.usersRepository.getBanUsers();
  //   const banBlogs = await this.dataSource.query(
  //     `SELECT * FROM public."Blogs"
  //           WHERE "banStatus"=true`,
  //   );
  //   const sortPostsArray = await this.dataSource.query(
  //     `SELECT * FROM public."Posts"
  //           WHERE NOT "userId"= ANY ($1) AND NOT "blogId"=ANY($2)
  //           ORDER BY "${query.sortBy}" ${query.sortDirection}
  //           LIMIT $3 OFFSET $4`,
  //     [
  //       banUsers.map((a) => {
  //         return a.id;
  //       }),
  //       banBlogs.map((a) => {
  //         return a.id;
  //       }),
  //       query.pageSize,
  //       this.queryCount.skipHelper(query.pageNumber, query.pageSize),
  //     ],
  //   );
  //   const totalCount = await this.dataSource.query(
  //     `SELECT count(*) FROM public."Posts"
  //           WHERE NOT "userId"=ANY($1)`,
  //     [
  //       banUsers.map((a) => {
  //         return a.id;
  //       }),
  //     ],
  //   );
  //   return {
  //     pagesCount: this.queryCount.pagesCountHelper(
  //       totalCount[0].count,
  //       query.pageSize,
  //     ),
  //     page: query.pageNumber,
  //     pageSize: query.pageSize,
  //     totalCount: +totalCount[0].count,
  //     items: await Promise.all(
  //       sortPostsArray.map(async (a) => {
  //         const infoLikes = await this.postsRepositorySql.getAllInfoAboutLikes(
  //           a.id,
  //         );
  //         const like = infoLikes.find((l) => 'Like' === l.status);
  //         const dislike = infoLikes.find((d) => 'Dislike' === d.status);
  //         const myStatus = await this.postsRepository.getMyStatus(userId, a.id);
  //         const main =
  //           await this.imageRepository.getInfoForImageByPostIdAndFolderName(
  //             a.id,
  //             'main',
  //           );
  //         const sortLikesArray = await this.dataSource.query(
  //           `SELECT * FROM public."LikesModel"
  //                   WHERE "id"=$1 AND "status"=$2
  //                  ORDER BY "createDate" COLLATE "C" DESC
  //                  LIMIT 3`,
  //           [a.id, 'Like'],
  //         );
  //         return {
  //           id: a.id,
  //           title: a.title,
  //           shortDescription: a.shortDescription,
  //           content: a.content,
  //           blogId: a.blogId,
  //           blogName: a.blogName,
  //           createdAt: a.createdAt,
  //           extendedLikesInfo: {
  //             likesCount: +like?.count || 0,
  //             dislikesCount: +dislike?.count || 0,
  //             myStatus: myStatus,
  //             newestLikes: sortLikesArray.map((b) => {
  //               return {
  //                 addedAt: b.createDate.toString(),
  //                 userId: b.userId,
  //                 login: b.login,
  //               };
  //             }),
  //           },
  //           images: {
  //             main: main.map((a) => {
  //               return {
  //                 url: a.url,
  //                 width: a.width,
  //                 height: a.height,
  //                 fileSize: a.fileSize,
  //               };
  //             }),
  //           },
  //         };
  //       }),
  //     ),
  //   };
  // }

  async getQueryPosts(query: any, userId: string) {
    // const totalCount = await this.dataSource.query(
    //   `SELECT count(*) FROM public."Posts"
    //           WHERE NOT "userId"=ANY($1)`,
    //   [
    //     banUsers.map((a) => {
    //       return a.id;
    //     }),
    //   ],
    // );

    const sortPostsArray = await this.dataSource.query(`
    SELECT lm."likesCount",
    JSON_BUILD_OBJECT('id', p.id, 'title', p.title, 'shortDescription', 
    p."shortDescription",'content', p.content, 'blogId', p."blogId", 'blogName', 
    p."blogName",'createdAt', p."createdAt") AS main,
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('addedAt', l."createDate", 'userId', l."userId", 'login',
     l.login))
    FROM "LikesModel" AS l
    WHERE l.id=p.id
    GROUP BY l."createDate"
    ORDER BY l."createDate" DESC
    LIMIT 3
    ) AS "newestLikes",
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('url',i.url,'width',i.width,'height',
    i.height,'fileSize',i."fileSize"))
    FROM "Image" AS i
    WHERE i."postId"=p.id AND i."folderName"='main'
    ) AS main_images
    FROM public."Posts" p
    LEFT JOIN(SELECT id, COUNT(*) AS "likesCount"
    FROM public."LikesModel"
    WHERE status='like'
    GROUP BY id) lm ON lm.id=p.id
    GROUP BY p.id,p.title,p."shortDescription",p.content,p."blogId",p."blogName",
    p."createdAt",lm."likesCount"
    `);

    return sortPostsArray;
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
          const main =
            await this.imageRepository.getInfoForImageByPostIdAndFolderName(
              a.id,
              'main',
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
            images: {
              main: main.map((a) => {
                return {
                  url: a.url,
                  width: a.width,
                  height: a.height,
                  fileSize: a.fileSize,
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
      items: await Promise.all(
        sortedBlogsArray.map(async (a) => {
          const wallpaper =
            await this.imageRepository.getInfoForImageByBlogIdAndFolderName(
              a.id,
              'wallpaper',
            );
          const main =
            await this.imageRepository.getInfoForImageByBlogIdAndFolderName(
              a.id,
              'main',
            );
          return {
            id: a.id,
            name: a.name,
            description: a.description,
            websiteUrl: a.websiteUrl,
            createdAt: a.createdAt,
            isMembership: a.isMembership,
            images: {
              wallpaper:
                wallpaper[0] === undefined
                  ? null
                  : {
                      url: wallpaper[0]?.url,
                      width: wallpaper[0]?.width,
                      height: wallpaper[0]?.height,
                      fileSize: wallpaper[0]?.fileSize,
                    },
              main: main.map((a) => {
                return {
                  url: a.url,
                  width: a.width,
                  height: a.height,
                  fileSize: a.fileSize,
                };
              }),
            },
          };
        }),
      ),
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
    // if (!blog[0]) throw new NotFoundException();
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

  async getQueryAllQuestionSa(query: any): Promise<AllQuestionsSa> {
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."QuizQuestions"
            WHERE "body" ILIKE $1`,
      [`%${query.bodySearchTerm}%`],
    );
    const allQuestions = await this.dataSource.query(
      `SELECT * FROM public."QuizQuestions"
            WHERE "body" ILIKE $1
            ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
            LIMIT $2 OFFSET $3`,
      [
        `%${query.bodySearchTerm}%`,
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
      items: allQuestions,
    };
  }

  async getQueryAllQuestionSaSortStatus(query: any): Promise<AllQuestionsSa> {
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public."QuizQuestions"
            WHERE "body" ILIKE $1 AND "published"=$2`,
      [query.bodySearchTerm, query.publishedStatus],
    );
    const allQuestions = await this.dataSource.query(
      `SELECT * FROM public."QuizQuestions",
            WHERE "body" ILIKE $1 AND "published"=$2
            ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
            LIMIT $3 OFFSET $4`,
      [
        query.bodySearchTerm,
        query.publishedStatus,
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
      totalCount: totalCount[0].count,
      items: allQuestions,
    };
  }

  async getQueryAllMyGames(query: any, id: string): Promise<AllMyGames> {
    const sortBy =
      query.sortBy === '' ||
      query.sortBy === undefined ||
      query.sortBy === 'pairCreatedDate' ||
      query.sortBy === 'createdAt'
        ? ['pairCreatedDate']
        : [query.sortBy, 'pairCreatedDate'];
    let allGames;
    let totalCount;
    if (sortBy.length === 1) {
      totalCount = await this.dataSource.query(
        `SELECT count(*) FROM "PairQuizGame"
            WHERE "playerId1"=$1 OR "playerId2"=$2`,
        [id, id],
      );
      allGames = await this.dataSource.query(
        `SELECT * FROM "PairQuizGame"
            WHERE "playerId1"=$1 OR "playerId2"=$2
            ORDER BY "${sortBy[0]}" COLLATE "C" ${query.sortDirection}
            LIMIT $3 OFFSET $4`,
        [
          id,
          id,
          query.pageSize,
          this.queryCount.skipHelper(query.pageNumber, query.pageSize),
        ],
      );
    } else {
      totalCount = await this.dataSource.query(
        `SELECT count(*) FROM "PairQuizGame"
            WHERE "playerId1"=$1 OR "playerId2"=$2`,
        [id, id],
      );
      allGames = await this.dataSource.query(
        `SELECT * FROM "PairQuizGame"
              WHERE "playerId1"=$1 OR "playerId2"=$2
              ORDER BY "${sortBy[0]}" COLLATE "C" ${query.sortDirection},
              "${sortBy[1]}" DESC
              LIMIT $3 OFFSET $4`,
        [
          id,
          id,
          query.pageSize,
          this.queryCount.skipHelper(query.pageNumber, query.pageSize),
        ],
      );
    }
    return {
      pagesCount: this.queryCount.pagesCountHelper(
        totalCount[0].count,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount[0].count,
      items: allGames.map((a) => {
        return {
          id: a.gameId,
          firstPlayerProgress: {
            answers: a.answersPlayer1,
            player: {
              id: a.playerId1,
              login: a.playerLogin1,
            },
            score: a.scorePlayer1,
          },
          secondPlayerProgress: {
            answers: a.answersPlayer2,
            player: {
              id: a.playerId2,
              login: a.playerLogin2,
            },
            score: a.scorePlayer2,
          },
          questions: a.questions,
          status: a.status,
          pairCreatedDate: a.pairCreatedDate,
          startGameDate: a.startGameDate,
          finishGameDate: a.finishGameDate,
        };
      }),
    };
  }

  async getQueryUsersTop(query: any): Promise<AllStatistics> {
    const newArray = Object.entries(query.sort);
    const sort = [];
    for (const a of newArray) {
      const b = a[1] === 'desc' ? 'DESC' : 'ASC';
      sort.push(`"${a[0]}" ` + b);
    }
    const totalCount = await this.dataSource.query(
      `SELECT count(*) FROM "StatisticGames"`,
    );
    const allStats = await this.dataSource.query(
      `SELECT * FROM "StatisticGames"
            ORDER BY ${sort}
            LIMIT $1 OFFSET $2`,
      [
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
      items: allStats.map((a) => {
        const { userId, login, ...all } = a;
        return {
          ...all,
          player: {
            id: userId,
            login,
          },
        };
      }),
    };
  }
}
