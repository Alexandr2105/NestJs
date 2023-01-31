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
} from '../../../common/helper/allTypes';
import { QueryCount } from '../../../common/helper/query.count';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsRepository } from '../comments/comments.repostitory';
import { PostsRepository } from '../posts/posts.repository';
import { BlogDocument } from '../blogs/schema/blogs.schema';
import { PostDocument } from '../posts/schema/posts.schema';
import { CommentDocument } from '../comments/schema/comment.schema';
import { User } from '../../sa/users/schema/user';
import { LikesModelDocument } from '../../../common/schemas/like.type.schema';
import { BanUser } from '../../sa/users/schema/banUser';
import { UsersRepository } from '../../sa/users/users.repository';

@Injectable()
export class QueryRepository {
  constructor(
    @InjectModel('blogs') protected blogsCollection: Model<BlogDocument>,
    @InjectModel('posts') protected postsCollection: Model<PostDocument>,
    @InjectModel('users') protected usersCollection: Model<User>,
    @InjectModel('comments')
    protected commentsCollection: Model<CommentDocument>,
    @InjectModel('likeStatuses')
    protected likeInfoCollection: Model<LikesModelDocument>,
    @InjectModel('banUsers') protected banUsers: Model<BanUser>,
    protected queryCount: QueryCount,
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async getQueryBlogs(query: any): Promise<BlogsQueryType> {
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
      items: sortedBlogsArray.map((a) => {
        return {
          id: a.id,
          name: a.name,
          description: a.description,
          websiteUrl: a.websiteUrl,
          createdAt: a.createdAt,
        };
      }),
    };
  }

  async getQueryPosts(query: any, userId: string): Promise<PostQueryType> {
    const banUsers = await this.usersRepository.getBunUsers();
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
    const banUsers = await this.usersRepository.getBunUsers();
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
  ): Promise<CommentsType | boolean> {
    const banUsers = await this.usersRepository.getBunUsers();
    const totalCount = await this.commentsCollection.countDocuments({
      idPost: postId,
      userId: {
        $nin: banUsers.map((a) => {
          return a.id;
        }),
      },
    });
    if (totalCount === 0) {
      return false;
    }
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
            a.userId,
            a.id,
          );
          return {
            id: a.id,
            content: a.content,
            userId: a.userId,
            userLogin: a.userLogin,
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
      items: sortedBlogsArray.map((a) => {
        return {
          id: a.id,
          name: a.name,
          description: a.description,
          websiteUrl: a.websiteUrl,
          createdAt: a.createdAt,
        };
      }),
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
      items: sortArrayComments.map((a) => {
        const post = arrayPosts.find((b) => a.userId === b.userId);
        // if (post) throw new NotFoundException();
        return {
          id: a.id,
          content: a.content,
          commentatorInfo: {
            userId: a.userId,
            userLogin: a.userLogin,
          },
          createdAt: a.createdAt,
          postInfo: {
            id: post.id || undefined,
            title: post.title || undefined,
            blogId: post.blogId || undefined,
            blogName: post.blogName || undefined,
          },
        };
      }),
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
    const totalCount = await this.usersCollection.countDocuments({
      id: blog.banUsers.map((a) => {
        return a.userId;
      }),
      login: { $regex: query.searchLoginTerm, $options: 'i' },
    });
    const banUsersArraySort = await this.usersCollection
      .find({
        id: blog.banUsers.map((a) => {
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
        const banInfo = blog.banUsers.find((b) => a.id === b.userId);
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
