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
import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryRepositorySql extends IQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly queryCount: QueryCount,
  ) {
    super();
  }

  async getQueryBlogs(query: any, userId: string): Promise<BlogsQueryType> {
    const [{ count: totalCount }] = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM public."Blogs" b
    WHERE "name" ILIKE $1 AND "banStatus"=false
    `,
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
      pagesCount: this.queryCount.pagesCountHelper(+totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount,
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

  async getQueryPosts(query: any, userId: string): Promise<PostQueryType> {
    const [{ count: totalCount }] = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."Posts"
    WHERE NOT "userId" = ANY(SELECT id FROM public."Users" u WHERE u.ban=true )
    AND NOT "blogId" = ANY(SELECT id FROM public."Blogs" b WHERE b."banStatus"=true)
    `);
    const sortPostsArray = await this.dataSource.query(
      `SELECT lm."likesCount", dm."dislikesCount", ms.status,
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
    ) AS "mainImages"
    FROM public."Posts" p
    LEFT JOIN(SELECT id, COUNT(*) AS "likesCount"
    FROM public."LikesModel"
    WHERE status='Like'
    GROUP BY id) lm ON lm.id=p.id
    LEFT JOIN(SELECT id, COUNT(*) AS "dislikesCount"
    FROM public."LikesModel"
    WHERE status='Dislike'
    GROUP BY id) dm ON dm.id=p.id
    LEFT JOIN public."LikesModel" ms ON ms."userId"=$1 AND ms.id=p.id
    WHERE NOT p."userId" = ANY(SELECT id FROM public."Users" u WHERE u.ban=true )
    AND NOT p."blogId" = ANY(SELECT id FROM public."Blogs" b WHERE b."banStatus"=true)
    GROUP BY p.id,p.title,p."shortDescription",p.content,p."blogId",p."blogName",
    p."createdAt",lm."likesCount",dm."dislikesCount",ms.status
    ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
    LIMIT $2 OFFSET $3`,
      [
        userId,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    return {
      pagesCount: this.queryCount.pagesCountHelper(+totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount,
      items: sortPostsArray.map((a) => {
        return {
          ...a.main,
          extendedLikesInfo: {
            likesCount: a.likesCount === null ? 0 : +a.likesCount,
            dislikesCount: a.dislikesCount === null ? 0 : +a.dislikesCount,
            myStatus: a.status === null ? 'None' : a.status,
            newestLikes: a.newestLikes === null ? [] : a.newestLikes,
          },
          images: {
            main: a.mainImages === null ? [] : a.mainImages,
          },
        };
      }),
    };
  }

  async getQueryPostsBlogsId(
    query: any,
    blogId: string,
    userId: string,
  ): Promise<PostQueryType> {
    const [{ count: totalCount }] = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM public."Posts"
    WHERE "blogId"=$1 AND NOT "userId"= ANY(SELECT "userId" FROM public."BanUsers")
    `,
      [blogId],
    );

    const sortPostsId = await this.dataSource.query(
      `
    SELECT lm."likesCount",dm."dislikesCount",ms.status,
    JSON_BUILD_OBJECT('id', p.id, 'title', p.title, 'shortDescription', p."shortDescription", 
    'content', p.content, 'blogId', p."blogId", 'blogName', p."blogName",
    'createdAt', p."createdAt") AS main,
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('addedAt',l."createDate",'userId',l."userId",
    'login',l.login))
    FROM public."LikesModel" l
    WHERE p.id=id) AS "newestLikes",
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('url',i.url,'width',i.width,'height',i.height,
    'fileSize',i."fileSize"))
    FROM public."Image" i
    WHERE "postId"=p.id) AS images
    FROM public."Posts" p
    LEFT JOIN(SELECT id,COUNT(*) AS "likesCount" 
    FROM public."LikesModel"
    WHERE status='Like'
    GROUP BY id) lm ON lm.id=p.id
    LEFT JOIN(SELECT id, COUNT(*) AS "dislikesCount"
    FROM public."LikesModel"
    WHERE status='Dislike'
    GROUP BY id) dm ON dm.id=p.id
    LEFT JOIN public."LikesModel" ms ON ms."userId"=$1 AND ms.id=p.id
    WHERE "blogId"=$2 AND NOT p."userId"= ANY(SELECT "userId" FROM public."BanUsers")
    ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
    LIMIT $3 OFFSET $4
    `,
      [
        userId,
        blogId,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    return {
      pagesCount: this.queryCount.pagesCountHelper(+totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount,
      items: sortPostsId.map((a) => {
        return {
          ...a.main,
          extendedLikesInfo: {
            likesCount: a.likesCount === null ? 0 : a.likesCount,
            dislikesCount: a.dislikesCount === null ? 0 : a.dislikesCount,
            myStatus: a.status === null ? 'None' : a.status,
            newestLikes: a.newestLikes === null ? [] : a.newestLikes,
          },
          images: {
            main: a.images === null ? [] : a.images,
          },
        };
      }),
    };
  }

  async getQueryAllUsers(query: any): Promise<UserQueryType> {
    const [{ count: totalCount }] = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM public."Users"
    WHERE "login" ILIKE $1
    OR "email" ILIKE $2
    `,
      [`%${query.searchLoginTerm}%`, `%${query.searchEmailTerm}%`],
    );
    const sortArrayUsers = await this.dataSource.query(
      `
    SELECT b."isBanned",b."banDate",b."banReason",
    JSON_BUILD_OBJECT('id',u.id,'login',u.login,'email',u.email,'createdAt',u."createdAt") AS users
    FROM public."Users" u
    LEFT JOIN public."BanUsers" b ON u.id=b."userId"
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
    return this.returnObject(query, +totalCount, sortArrayUsers);
  }

  async getQuerySortUsers(query: any): Promise<UserQueryType> {
    const [{ count: totalCount }] = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM public."Users"
    WHERE ("login" ILIKE $1
    OR "email" ILIKE $2)
    AND "ban"=$3
    `,
      [
        `%${query.searchLoginTerm}%`,
        `%${query.searchEmailTerm}%`,
        query.banStatus === 'banned',
      ],
    );
    const sortArrayUsers = await this.dataSource.query(
      `SELECT
    JSON_BUILD_OBJECT('id',u.id,'login',u.login,'email',u.email,'createdAt',
    u."createdAt") AS users
    FROM public."Users" u
    LEFT JOIN public."BanUsers" b ON b."userId"= u.id
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
    return this.returnObject(query, +totalCount, sortArrayUsers);
  }

  async getQueryCommentsByPostId(
    query: any,
    postId: string,
    userId: string,
  ): Promise<CommentsType | boolean> {
    const [{ count: totalCount }] = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM public."Comments"
    WHERE "idPost"=$1 AND NOT "userId"=ANY(SELECT "userId" FROM public."BanUsers")
    `,
      [postId],
    );
    const sortCommentsByPostId = await this.dataSource.query(
      `
    SELECT c.*, lm."likesCount", dm."dislikesCount",ls.status AS "myStatus"
    FROM public."Comments" c
    LEFT JOIN(SELECT id,COUNT(*) AS "likesCount"
    FROM public."LikesModel" 
    WHERE id=$1
    GROUP BY id)lm ON lm.id=c.id
    LEFT JOIN(SELECT id, COUNT(*) AS "dislikesCount"
    FROM public."LikesModel"
    WHERE id=$1
    GROUP BY id)dm ON dm.id=c.id
    LEFT JOIN public."LikesModel" ls ON ls."userId"=$4 AND ls.id=c.id
    WHERE "idPost"=$1 AND NOT c."userId"=ANY(SELECT "userId" FROM public."BanUsers")
    ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
    LIMIT $2 OFFSET $3
    `,
      [
        postId,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
        userId,
      ],
    );
    return {
      pagesCount: this.queryCount.pagesCountHelper(+totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount,
      items: sortCommentsByPostId.map((a) => {
        return {
          id: a.id,
          content: a.content,
          commentatorInfo: {
            userId: a.userId,
            userLogin: a.userLogin,
          },
          createdAt: a.createdAt,
          likesInfo: {
            likesCount: a.likesCount === null ? 0 : a.likesCount,
            dislikesCount: a.dislikesCount === null ? 0 : a.dislikesCount,
            myStatus: a.myStatus === null ? 'None' : a.myStatus,
          },
        };
      }),
    };
  }

  async getQueryBlogsAuthUser(
    query: any,
    userId: string,
  ): Promise<BlogsQueryType> {
    const [{ count: totalCount }] = await this.dataSource.query(
      `SELECT count(*) FROM public."Blogs"
              WHERE "name" ILIKE $1 AND "userId"=$2`,
      [`%${query.searchNameTerm}%`, userId],
    );
    const sortedBlogsArray = await this.dataSource.query(
      `
    SELECT "wallpaperObject", "mainObject",
    JSON_BUILD_OBJECT('id',b.id,'name',b.name,'description',b.description,
    'websiteUrl',b."websiteUrl",'createdAt',b."createdAt",'isMembership',b."isMembership") AS "blogInfo"
    FROM public."Blogs" b
    LEFT JOIN(SELECT "blogId", JSON_BUILD_OBJECT('url',w.url,'width',w.width,
    'height',w.height,'fileSize',w."fileSize") AS "wallpaperObject"
    FROM public."Image" w
    WHERE "folderName"='wallpaper'
    ) AS wallpaper ON wallpaper."blogId"=b.id
    LEFT JOIN(SELECT "blogId", JSON_AGG(JSON_BUILD_OBJECT('url',m.url,'width',m.width,
    'height',m.height,'fileSize',m."fileSize")) AS "mainObject"
    FROM public."Image" m
    WHERE "folderName"='main'
    GROUP BY "blogId"
    )AS main ON main."blogId"=b.id
    WHERE "name" ILIKE $1 AND "userId"=$2
    ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
    LIMIT $3 OFFSET $4
    `,
      [
        `%${query.searchNameTerm}%`,
        userId,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    return {
      pagesCount: this.queryCount.pagesCountHelper(+totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount,
      items: sortedBlogsArray.map((a) => {
        return {
          ...a.blogInfo,
          images: {
            wallpaper: a.wallpaperObject,
            main: a.mainObject === null ? [] : a.mainObject,
          },
        };
      }),
    };
  }

  async getQueryBlogsSA(query: any): Promise<BlogsQueryTypeSA> {
    const [{ count: totalCount }] = await this.dataSource.query(
      `SELECT COUNT(*) FROM public."Blogs"
              WHERE name ILIKE $1`,
      [`%${query.searchNameTerm}%`],
    );
    const sortedBlogsArray = await this.dataSource.query(
      `
    SELECT b.*, u.login AS login, u.id AS "userId"
    FROM public."Blogs" b
    LEFT JOIN public."Users" u ON u.id = b."userId"
    WHERE name ILIKE $1
    ORDER BY b."${query.sortBy}" COLLATE "C" ${query.sortDirection}
    LIMIT $2 OFFSET $3
    `,
      [
        `%${query.searchNameTerm}%`,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    return {
      pagesCount: this.queryCount.pagesCountHelper(+totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount,
      items: sortedBlogsArray.map((a) => {
        return {
          id: a.id,
          name: a.name,
          description: a.description,
          websiteUrl: a.websiteUrl,
          createdAt: a.createdAt,
          isMembership: a.isMembership,
          blogOwnerInfo: {
            userId: a.userId,
            userLogin: a.login,
          },
          banInfo: { isBanned: a.banStatus, banDate: a.banDate },
        };
      }),
    };
  }

  async returnObject(query, totalCount, sortArrayUsers) {
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: sortArrayUsers.map((a) => {
        return {
          ...a.users,
          banInfo: {
            isBanned: a.isBanned === null ? false : a.isBanned,
            banDate: a.banDate,
            banReason: a.banReason,
          },
        };
      }),
    };
  }

  async getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs> {
    const [{ count: totalCount }] = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM public."Comments"
    WHERE "idPost"=ANY(SELECT "id" FROM public."Posts" WHERE "userId"=$1 )
    `,
      [userId],
    );
    const sortArrayComments = await this.dataSource.query(
      `
    SELECT c.*,p.id AS "postId", p.title,p."blogId",p."blogName", "likesCount",
    "dislikesCount", ms
    FROM public."Comments" c
    LEFT JOIN public."Posts" p ON c."idPost"=p.id
    LEFT JOIN (SELECT "userId", COUNT(*) AS "likesCount" 
    FROM public."LikesModel"
    WHERE status='Like'
    GROUP BY "userId") AS lm ON lm."userId"=c."userId"
    LEFT JOIN (SELECT "userId", COUNT(*) AS "dislikesCount" 
    FROM public."LikesModel"
    WHERE status='Dislike'
    GROUP BY "userId") AS dm ON dm."userId"=c."userId"
    LEFT JOIN public."LikesModel" ms ON ms."userId"=$1
    WHERE "idPost"=ANY(SELECT "id" FROM public."Posts" WHERE "userId"=$1 )
    ORDER BY c."${query.sortBy}" COLLATE "C" ${query.sortDirection}
    LIMIT $2 OFFSET $3
    `,
      [
        userId,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    return {
      pagesCount: this.queryCount.pagesCountHelper(+totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount,
      items: sortArrayComments.map((a) => {
        return {
          id: a.id,
          content: a.content,
          commentatorInfo: {
            userId: a.userId,
            userLogin: a.userLogin,
          },
          createdAt: a.createdAt,
          postInfo: {
            id: a.postId,
            title: a.title,
            blogId: a.blogId,
            blogName: a.blogName,
          },
          likesInfo: {
            likesCount: a.likesCount === null ? 0 : a.likesCount,
            dislikesCount: a.dislikesCount === null ? 0 : a.dislikesCount,
            myStatus: a.ms === null ? 'None' : a.ms,
          },
        };
      }),
    };
  }

  async getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
  ): Promise<BanUsersInfoForBlog> {
    const [{ count: totalCount }] = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM public."Users"
    WHERE id = ANY(SELECT "userId" FROM public."BanUsersForBlog" WHERE "blogId"=$1)
    AND login ILIKE $2
    `,
      [blogId, `%${query.searchLoginTerm}%`],
    );
    const banUsersArraySort = await this.dataSource.query(
      `
    SELECT u.id,u.login,b."isBanned",b."banDate",b."banReason" 
    FROM public."Users" u
    LEFT JOIN public."BanUsersForBlog" b ON b."userId"=u.id 
    WHERE id = ANY(SELECT "userId" FROM public."BanUsersForBlog" WHERE "blogId"=$1)
    AND login ILIKE $2
    ORDER BY "${query.sortBy}" COLLATE "C" ${query.sortDirection}
    LIMIT $3 OFFSET $4
    `,
      [
        blogId,
        `%${query.searchLoginTerm}%`,
        query.pageSize,
        this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      ],
    );
    return {
      pagesCount: this.queryCount.pagesCountHelper(+totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: +totalCount,
      items: banUsersArraySort.map((a) => {
        return {
          id: a.id,
          login: a.login,
          banInfo: {
            isBanned: a.isBanned,
            banDate: a.banDate,
            banReason: a.banReason,
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
