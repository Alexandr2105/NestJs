import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BlogsQueryType,
  PostQueryType,
  UserQueryType,
  CommentsType,
  BlogsQueryTypeSA,
  AllCommentsForAllPostsCurrentUserBlogs,
  BanUsersInfoForBlog,
  AllQuestionsSa,
  AllMyGames,
  AllStatistics,
} from '../../../common/helper/allTypes';
import { QueryCount } from '../../../common/helper/query.count';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogDocument } from '../blogs/schema/blogs.schema';
import { PostDocument } from '../posts/schema/posts.schema';
import { CommentDocument } from '../comments/schema/comment.schema';
import { User } from '../../sa/users/schema/user';
import { LikesModelDocument } from '../../../common/schemas/like.type.schema';
import { BanUsers } from '../../sa/users/schema/banUsers';
import { BanUsersForBlogDocument } from '../blogs/schema/ban.users.for.blog.schema';
import { IUsersRepository } from '../../sa/users/i.users.repository';
import { IQueryRepository } from './i.query.repository';
import { IPostsRepository } from '../posts/i.posts.repository';
import { ICommentsRepository } from '../comments/i.comments.repository';
import { QuestionDocument } from '../../sa/quizQuestions/schema/question.schema';
import { PairQuizGameDocument } from '../pairQuizGame/schema/pair.quiz.game.schema';
import { StatisticGamesDocument } from '../pairQuizGame/schema/statistic.games.schema';
import { IImageRepository } from '../imageRepository/i.image.repository';
import { ISubscriptionsRepository } from '../subscriptionsRepository/i.subscriptions.repository';

@Injectable()
export class QueryRepositoryMongo extends IQueryRepository {
  constructor(
    @InjectModel('blogs') private readonly blogsCollection: Model<BlogDocument>,
    @InjectModel('posts') private readonly postsCollection: Model<PostDocument>,
    @InjectModel('users') private readonly usersCollection: Model<User>,
    @InjectModel('comments')
    private readonly commentsCollection: Model<CommentDocument>,
    @InjectModel('likeStatuses')
    private readonly likeInfoCollection: Model<LikesModelDocument>,
    @InjectModel('banUsers') private readonly banUsers: Model<BanUsers>,
    @InjectModel('banUsersForBlogs')
    private readonly banUsersForBlogsCollection: Model<BanUsersForBlogDocument>,
    @InjectModel('quizQuestions')
    private readonly questions: Model<QuestionDocument>,
    @InjectModel('infoQuizQuestionsGames')
    private readonly quizGameCollection: Model<PairQuizGameDocument>,
    @InjectModel('statisticGames')
    private readonly statisticGames: Model<StatisticGamesDocument>,
    private readonly queryCount: QueryCount,
    private readonly commentsRepository: ICommentsRepository,
    private readonly postsRepository: IPostsRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly imageRepository: IImageRepository,
    private readonly subscriptionsRepository: ISubscriptionsRepository,
  ) {
    super();
  }

  async getQueryBlogs(query: any, userId: string): Promise<BlogsQueryType> {
    const totalCount = await this.blogsCollection.countDocuments({
      name: {
        $regex: query.searchNameTerm,
        $options: 'i',
      },
      banStatus: false,
    });
    const sortedBlogsArray = await this.blogsCollection
      .find({
        name: {
          $regex: query.searchNameTerm,
          $options: 'i',
        },
        banStatus: false,
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
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
          const subscription =
            await this.subscriptionsRepository.getSubscriptionFromBlogIdAndUserId(
              a.id,
              userId,
            );
          const count =
            await this.subscriptionsRepository.getSubscriptionsCountFromBlogId(
              a.id,
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
            currentUserSubscriptionStatus:
              subscription?.status === undefined ? 'None' : subscription.status,
            subscribersCount: count,
          };
        }),
      ),
    };
  }

  async getQueryPosts(query: any, userId: string): Promise<PostQueryType> {
    const banUsers = await this.usersRepository.getBanUsers();
    const banBlogs = await this.blogsCollection.find({ banStatus: true });
    const sortPostsArray = await this.postsCollection
      .find({
        userId: {
          $nin: banUsers.map((a) => {
            return a.id;
          }),
        },
        blogId: {
          $nin: banBlogs.map((a) => {
            return a.id;
          }),
        },
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(+query.pageSize);
    const totalCount = await this.postsCollection.countDocuments({
      userId: {
        $nin: banUsers.map((a) => {
          return a.id;
        }),
      },
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        sortPostsArray.map(async (a) => {
          const likeStatus = await this.postsRepository.getLikesInfo(a.id);
          const dislikeStatus = await this.postsRepository.getDislikeInfo(a.id);
          const myStatus = await this.postsRepository.getMyStatus(userId, a.id);
          const main =
            await this.imageRepository.getInfoForImageByPostIdAndFolderName(
              a.id,
              'main',
            );
          const sortLikesArray = await this.likeInfoCollection
            .find({
              id: a.id,
              status: 'Like',
            })
            .sort({ ['createDate']: 'desc' })
            .limit(3);
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

  async getQueryPostsBlogsId(
    query: any,
    blogId: string,
    userId: string,
  ): Promise<PostQueryType> {
    const banUsers = await this.usersRepository.getBanUsers();
    const totalCount = await this.postsCollection.countDocuments({
      blogId: blogId,
      userId: {
        $nin: banUsers.map((a) => {
          return a.id;
        }),
      },
    });
    const sortPostsId = await this.postsCollection
      .find({
        blogId: blogId,
        userId: {
          $nin: banUsers.map((a) => {
            return a.id;
          }),
        },
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
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
          const sortLikesArray = await this.likeInfoCollection
            .find({
              id: a.id,
              status: 'Like',
            })
            .sort({ ['createDate']: 'desc' })
            .limit(3);
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
    const totalCount = await this.usersCollection.countDocuments({
      $or: [
        { login: { $regex: query.searchLoginTerm, $options: 'i' } },
        {
          email: {
            $regex: query.searchEmailTerm,
            $options: 'i',
          },
        },
      ],
    });
    const sortArrayUsers = await this.usersCollection
      .find({
        $or: [
          { login: { $regex: query.searchLoginTerm, $options: 'i' } },
          {
            email: {
              $regex: query.searchEmailTerm,
              $options: 'i',
            },
          },
        ],
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return this.returnObject(query, totalCount, sortArrayUsers);
  }

  async getQuerySortUsers(query: any): Promise<UserQueryType> {
    const totalCount = await this.usersCollection.countDocuments({
      $or: [
        { login: { $regex: query.searchLoginTerm, $options: 'i' } },
        {
          email: {
            $regex: query.searchEmailTerm,
            $options: 'i',
          },
        },
      ],
      ban: query.banStatus === 'banned',
    });
    const sortArrayUsers = await this.usersCollection
      .find({
        $or: [
          { login: { $regex: query.searchLoginTerm, $options: 'i' } },
          {
            email: {
              $regex: query.searchEmailTerm,
              $options: 'i',
            },
          },
        ],
        ban: query.banStatus === 'banned',
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return this.returnObject(query, totalCount, sortArrayUsers);
  }

  async getQueryCommentsByPostId(
    query: any,
    postId: string,
    userId: string,
  ): Promise<CommentsType | boolean> {
    const banUsers = await this.usersRepository.getBanUsers();
    const totalCount = await this.commentsCollection.countDocuments({
      idPost: postId,
      userId: {
        $nin: banUsers.map((a) => {
          return a.id;
        }),
      },
    });
    const sortCommentsByPostId = await this.commentsCollection
      .find({
        idPost: postId,
        userId: {
          $nin: banUsers.map((a) => {
            return a.id;
          }),
        },
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
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
    const totalCount = await this.blogsCollection.countDocuments({
      name: {
        $regex: query.searchNameTerm,
        $options: 'i',
      },
      userId: userId,
    });
    const sortedBlogsArray = await this.blogsCollection
      .find({
        name: {
          $regex: query.searchNameTerm,
          $options: 'i',
        },
        userId: userId,
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
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
    const totalCount = await this.blogsCollection.countDocuments({
      name: {
        $regex: query.searchNameTerm,
        $options: 'i',
      },
    });
    const sortedBlogsArray = await this.blogsCollection
      .find({
        name: {
          $regex: query.searchNameTerm,
          $options: 'i',
        },
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
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
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        sortArrayUsers.map(async (a) => {
          const banInfo = await this.banUsers.findOne({ userId: a.id });
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

  async getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs> {
    const arrayPosts = await this.postsCollection.find({
      userId: userId,
    });
    const totalCount = await this.commentsCollection.countDocuments({
      idPost: arrayPosts.map((a) => {
        return a.id;
      }),
    });
    const sortArrayComments = await this.commentsCollection
      .find({
        idPost: arrayPosts.map((a) => {
          return a.id;
        }),
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        sortArrayComments.map(async (a) => {
          const comment = arrayPosts.find((b) => a.postId === b.id);
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
    const blog = await this.blogsCollection.findOne({
      id: blogId,
    });
    if (!blog) throw new NotFoundException();
    if (blog.userId !== ownerId) throw new ForbiddenException();
    const banUsers = await this.banUsersForBlogsCollection.find({
      blogId: blog.id,
    });
    const totalCount = await this.usersCollection.countDocuments({
      id: banUsers.map((a) => {
        return a.userId;
      }),
      login: { $regex: query.searchLoginTerm, $options: 'i' },
    });
    const banUsersArraySort = await this.usersCollection
      .find({
        id: banUsers.map((a) => {
          return a.userId;
        }),
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
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
    const totalCount = await this.questions.countDocuments({
      body: {
        $regex: query.bodySearchTerm,
        $options: 'i',
      },
    });
    const allQuestions = await this.questions
      .find({
        body: {
          $regex: query.bodySearchTerm,
          $options: 'i',
        },
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allQuestions.map((a) => {
        return {
          id: a.id,
          body: a.body,
          correctAnswers: a.correctAnswers,
          published: a.published,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        };
      }),
    };
  }

  async getQueryAllQuestionSaSortStatus(query: any): Promise<AllQuestionsSa> {
    const totalCount = await this.questions.countDocuments({
      body: {
        $regex: query.bodySearchTerm,
        $options: 'i',
      },
      published: query.publishedStatus,
    });
    const allQuestions = await this.questions
      .find({
        body: {
          $regex: query.bodySearchTerm,
          $options: 'i',
        },
        published: query.publishedStatus,
      })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allQuestions.map((a) => {
        return {
          id: a.id,
          body: a.body,
          correctAnswers: a.correctAnswers,
          published: a.published,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        };
      }),
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
    const totalCount = await this.quizGameCollection.countDocuments({
      $or: [{ playerId1: id }, { playerId2: id }],
    });
    let allGames;
    if (sortBy.length === 1) {
      allGames = await this.quizGameCollection
        .find({
          $or: [{ playerId1: id }, { playerId2: id }],
        })
        .sort({ [sortBy[0]]: query.sortDirection })
        .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
        .limit(query.pageSize);
    } else {
      allGames = await this.quizGameCollection
        .find({
          $or: [{ playerId1: id }, { playerId2: id }],
        })
        .sort({ [sortBy[0]]: query.sortDirection, [sortBy[1]]: -1 })
        .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
        .limit(query.pageSize);
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
    const totalCount = await this.statisticGames.countDocuments();
    const sortAllGames = await this.statisticGames
      .find()
      .select('-_id -__v')
      .sort(query.sort)
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(query.pageSize);
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: sortAllGames.map((a) => {
        return {
          sumScore: a.sumScore,
          avgScores: a.avgScores,
          gamesCount: a.gamesCount,
          winsCount: a.winsCount,
          lossesCount: a.lossesCount,
          drawsCount: a.drawsCount,
          player: {
            id: a.userId,
            login: a.login,
          },
        };
      }),
    };
  }
}
