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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../blogs/entity/blog.entity';
import { ILike, Repository } from 'typeorm';
import { QueryCount } from '../../../common/helper/query.count';
import { PostEntity } from '../posts/entity/post.entity';
import { CommentEntity } from '../comments/entity/comment.entity';
import { UserEntity } from '../../sa/users/entity/user.entity';
import { QuizQuestionEntity } from '../../sa/quizQuestions/entity/quiz.question.entity';
import { PairQuizGameEntity } from '../pairQuizGame/entity/pair.quiz.game.entity';
import { StatisticGamesEntity } from '../pairQuizGame/entity/statistic.games.entity';

@Injectable()
export class QueryRepositoryTypeorm extends IQueryRepository {
  constructor(
    private readonly queryCount: QueryCount,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
    @InjectRepository(QuizQuestionEntity)
    private readonly questionsRepository: Repository<QuizQuestionEntity>,
    @InjectRepository(PairQuizGameEntity)
    private readonly pairQuizGameRepository: Repository<PairQuizGameEntity>,
    @InjectRepository(StatisticGamesEntity)
    private readonly gamesStats: Repository<StatisticGamesEntity>,
  ) {
    super();
  }

  async getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
  ): Promise<BanUsersInfoForBlog> {
    const [sortUsers, totalCount] = await this.usersRepository.findAndCount({
      where: {
        banInfoForBlogs: { blogId: blogId },
        login: ILike(`%${query.searchNameTerm}%`),
      },
      select: {
        id: true,
        login: true,
        createdAt: true,
        banInfoForBlogs: { isBanned: true, banDate: true, banReason: true },
      },
      relations: { banInfoForBlogs: true },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: sortUsers.map((a) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { banInfoForBlogs, createdAt, ...all } = a;
        return {
          ...all,
          banInfo: banInfoForBlogs[0],
        };
      }),
    };
  }

  async getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs> {
    const [info, totalCount] = await this.commentsRepository.findAndCount({
      where: { post: { userId: userId } },
      select: {
        createdAt: true,
        id: true,
        content: true,
        userId: true,
        userLogin: true,
        likeStatus: { userId: true, status: true },
        post: { id: true, title: true, blogName: true, blogId: true },
      },
      relations: { likeStatus: true, post: true },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: info.map((a) => {
        const like = a.likeStatus.filter((l) => l.status === 'Like');
        const dislike = a.likeStatus.filter((d) => d.status === 'Dislike');
        const myStatus = a.likeStatus.find((m) => m.userId === userId);
        return {
          id: a.id,
          content: a.content,
          commentatorInfo: {
            userId: a.userId,
            userLogin: a.userLogin,
          },
          createdAt: a.createdAt,
          postInfo: a.post,
          likesInfo: {
            likesCount: like.length,
            dislikesCount: dislike.length,
            myStatus: myStatus?.status === undefined ? 'None' : myStatus.status,
          },
        };
      }),
    };
  }

  async getQueryAllUsers(query: any): Promise<UserQueryType> {
    const [sortUsers, totalCount] = await this.usersRepository.findAndCount({
      where: [
        { login: ILike(`%${query.searchLoginTerm}%`) },
        { email: ILike(`%${query.searchEmailTerm}%`) },
      ],
      relations: { banUsers: true },
      select: {
        banUsers: { banDate: true, isBanned: true, banReason: true },
        id: true,
        login: true,
        email: true,
        createdAt: true,
      },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return this.returnObject(query, totalCount, sortUsers);
  }

  async getQueryBlogs(query: any, userId: string): Promise<BlogsQueryType> {
    const [allBlogs, totalCount] = await this.blogsRepository.findAndCount({
      where: {
        name: ILike(`%${query.searchNameTerm}%`),
        banStatus: false,
      },
      relations: { image: true, subscriptions: true },
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
        image: {
          id: true,
          folderName: true,
          url: true,
          width: true,
          height: true,
          fileSize: true,
        },
      },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allBlogs.map((a) => {
        const { image, subscriptions, ...all } = a;
        let wallpaper = null;
        const main = [];
        image.map((b) => {
          const { id, folderName, ...all } = b;
          if (folderName === 'wallpaper') {
            wallpaper = all;
          } else if (folderName === 'main') {
            main.push(all);
          }
        });
        let status = 'None';
        let subscriptionsLength = 0;
        subscriptions.map((c) => {
          if (c.userId === userId) {
            c.status === undefined ? (status = 'None') : (status = c.status);
          }
          if (c.status === 'Subscribed') {
            subscriptionsLength++;
          }
        });
        return {
          ...all,
          images: { wallpaper: wallpaper, main: main },
          currentUserSubscriptionStatus: status,
          subscribersCount: subscriptionsLength,
        };
      }),
    };
  }

  async getQueryBlogsAuthUser(
    query: any,
    userId: string,
  ): Promise<BlogsQueryType> {
    const [allBlogs, totalCount] = await this.blogsRepository.findAndCount({
      where: {
        userId: userId,
        name: ILike(`%${query.searchNameTerm}%`),
      },
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
        image: {
          id: true,
          url: true,
          width: true,
          height: true,
          fileSize: true,
          folderName: true,
        },
      },
      relations: { image: true },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allBlogs.map((a) => {
        const { image, ...all } = a;
        let wallpaper = null;
        const main = [];
        image.map((b) => {
          const { id, folderName, ...all } = b;
          if (folderName === 'wallpaper') {
            wallpaper = all;
          } else if (folderName === 'main') {
            main.push(all);
          }
        });
        return {
          ...all,
          images: { wallpaper: wallpaper, main: main },
        };
      }),
    };
  }

  async getQueryBlogsSA(query: any): Promise<BlogsQueryTypeSA> {
    const [blogs, totalCount] = await this.blogsRepository.findAndCount({
      where: { name: ILike(`%${query.searchNameTerm}%`) },
      relations: { user: true },
      select: { user: { login: true } },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: blogs.map((a) => {
        const { user, banStatus, userId, banDate, ...all } = a;
        return {
          ...all,
          blogOwnerInfo: {
            userId: userId,
            userLogin: user.login,
          },
          banInfo: { isBanned: banStatus, banDate },
        };
      }),
    };
  }

  async getQueryCommentsByPostId(
    query: any,
    postId: string,
    userId: string,
  ): Promise<CommentsType | boolean> {
    const [comments, totalCount] = await this.commentsRepository.findAndCount({
      where: { postId: postId, user: { ban: false } },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        userLogin: true,
        likeStatus: { userId: true, status: true },
      },
      relations: { likeStatus: true },
      order: {
        [query.sortBy]: query.sortDirection,
      },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: comments.map((a) => {
        const like = a.likeStatus.filter((l) => l.status === 'Like');
        const dislike = a.likeStatus.filter((d) => d.status === 'Dislike');
        const myStatus = a.likeStatus.find((m) => m.userId === userId);
        return {
          id: a.id,
          content: a.content,
          commentatorInfo: {
            userId: a.userId,
            userLogin: a.userLogin,
          },
          createdAt: a.createdAt,
          likesInfo: {
            likesCount: like.length,
            dislikesCount: dislike.length,
            myStatus: myStatus?.status === undefined ? 'None' : myStatus.status,
          },
        };
      }),
    };
  }

  async getQueryPosts(query: any, userId: string): Promise<PostQueryType> {
    const [allPosts, totalCount] = await this.postsRepository.findAndCount({
      where: {
        user: { ban: false },
        blog: { banStatus: false },
      },
      select: {
        id: true,
        shortDescription: true,
        title: true,
        content: true,
        blogId: true,
        blogName: true,
        createdAt: true,
        likeStatus: { userId: true, login: true, createDate: true },
        image: {
          id: true,
          url: true,
          width: true,
          height: true,
          fileSize: true,
        },
      },
      relations: { likeStatus: true, image: true },
      order: {
        [query.sortBy]: query.sortDirection,
        likeStatus: { createDate: 'DESC' },
      },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allPosts.map((a) => {
        const { likeStatus, image, ...all } = a;
        const like = likeStatus.filter((l) => l.status === 'Like');
        const dislike = likeStatus.filter((d) => d.status === 'Dislike');
        const myStatus = likeStatus.find((m) => m.userId === userId);
        const main = [];
        const newestLikes = likeStatus.splice(0, 3).map((a) => {
          return {
            addedAt: a.createDate,
            userId: a.userId,
            login: a.login,
          };
        });
        image.map((b) => {
          const { id, ...all } = b;
          main.push(all);
        });
        return {
          ...all,
          extendedLikesInfo: {
            likesCount: like.length,
            dislikesCount: dislike.length,
            myStatus: myStatus?.status === undefined ? 'None' : myStatus.status,
            newestLikes: newestLikes,
          },
          images: {
            main: main,
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
    const [allPosts, totalCount] = await this.postsRepository.findAndCount({
      where: { blogId: blogId, user: { ban: false } },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        blogId: true,
        blogName: true,
        createdAt: true,
        likeStatus: { login: true, userId: true, createDate: true },
        image: {
          id: true,
          url: true,
          width: true,
          height: true,
          fileSize: true,
        },
      },
      relations: { likeStatus: true, image: true },
      order: {
        likeStatus: { createDate: 'DESC' },
        image: { fileSize: 'desc' } /*для прохождения теста сделал*/,
        [query.sortBy]: query.sortDirection,
      },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allPosts.map((a) => {
        const { likeStatus, image, ...all } = a;
        const like = likeStatus.filter((l) => l.status === 'Like');
        const dislike = likeStatus.filter((d) => d.status === 'Dislike');
        const myStatus = likeStatus.find((m) => m.userId === userId);
        const newestLikes = likeStatus.splice(0, 3).map((a) => {
          return {
            addedAt: a.createDate,
            userId: a.userId,
            login: a.login,
          };
        });
        const extendedLikesInfo = {
          likesCount: like.length,
          dislikesCount: dislike.length,
          myStatus: myStatus?.status === undefined ? 'None' : myStatus.status,
          newestLikes,
        };
        return {
          ...all,
          extendedLikesInfo,
          images: {
            main: image.map((b) => {
              return {
                url: b.url,
                width: b.width,
                height: b.height,
                fileSize: b.fileSize,
              };
            }),
          },
        };
      }),
    };
  }

  async getQuerySortUsers(query: any): Promise<UserQueryType> {
    const [sortUsers, totalCount] = await this.usersRepository.findAndCount({
      where: [
        {
          login: ILike(`%${query.searchLoginTerm}%`),
          ban: query.banStatus === 'banned',
        },
        {
          email: ILike(`%${query.searchEmailTerm}%`),
          ban: query.banStatus === 'banned',
        },
      ],
      relations: { banUsers: true },
      select: {
        banUsers: { banDate: true, isBanned: true, banReason: true },
        id: true,
        login: true,
        email: true,
        createdAt: true,
      },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return this.returnObject(query, totalCount, sortUsers);
  }

  async returnObject(query: any, totalCount: number, sortArrayUsers) {
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: sortArrayUsers.map((a) => {
        const { banUsers, ...all } = a;
        return {
          ...all,
          banInfo: {
            isBanned: banUsers?.isBanned || false,
            banDate: banUsers?.banDate || null,
            banReason: banUsers?.banReason || null,
          },
        };
      }),
    };
  }

  async getQueryAllQuestionSa(query: any): Promise<AllQuestionsSa> {
    const [sortQuestion, totalCount] =
      await this.questionsRepository.findAndCount({
        where: { body: ILike(`%${query.bodySearchTerm}%`) },
        order: { [query.sortBy]: query.sortDirection },
        skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
        take: query.pageSize,
      });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: sortQuestion,
    };
  }

  async getQueryAllQuestionSaSortStatus(query: any): Promise<AllQuestionsSa> {
    const [sortQuestion, totalCount] =
      await this.questionsRepository.findAndCount({
        where: {
          body: ILike(`%${query.bodySearchTerm}%`),
          published: query.published,
        },
        order: { [query.sortBy]: query.sortDirection },
        skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
        take: query.pageSize,
      });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: sortQuestion,
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
      [allGames, totalCount] = await this.pairQuizGameRepository.findAndCount({
        where: [{ playerId1: id }, { playerId2: id }],
        order: { [sortBy[0]]: query.sortDirection },
        skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
        take: query.pageSize,
      });
    } else {
      [allGames, totalCount] = await this.pairQuizGameRepository.findAndCount({
        where: [{ playerId1: id }, { playerId2: id }],
        order: { [sortBy[0]]: query.sortDirection, [sortBy[1]]: 'DESC' },
        skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
        take: query.pageSize,
      });
    }
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
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
    const [allStat, totalCount] = await this.gamesStats.findAndCount({
      order: query.sort,
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allStat.map((a) => {
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
