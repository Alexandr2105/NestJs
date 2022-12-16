import { Inject, Injectable } from '@nestjs/common';
import {
  BlogsQueryType,
  BlogsModel,
  PostQueryType,
  PostsModel,
  UsersModel,
  UserQueryType,
  CommentsModel,
  CommentsType,
  LikesModel,
} from '../helper/allTypes';
import { QueryCount } from '../helper/query.count';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsRepository } from '../comments/comments.repostitory';
import { PostsRepository } from '../posts/posts.repository';

@Injectable()
export class QueryRepository {
  constructor(
    @InjectModel('blogs') protected blogsCollection: Model<BlogsModel>,
    @InjectModel('posts') protected postsCollection: Model<PostsModel>,
    @InjectModel('users') protected usersCollection: Model<UsersModel>,
    @InjectModel('comments') protected commentsCollection: Model<CommentsModel>,
    @InjectModel('likeStatuses')
    protected likeInfoCollection: Model<LikesModel>,
    @Inject(QueryCount) protected queryCount: QueryCount,
    @Inject(CommentsRepository)
    protected commentsRepository: CommentsRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
  ) {}

  async getQueryBlogs(query: any): Promise<BlogsQueryType> {
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
    const sortPostsArray = await this.postsCollection
      .find({})
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(this.queryCount.skipHelper(query.pageNumber, query.pageSize))
      .limit(+query.pageSize);
    const totalCount = await this.postsCollection.countDocuments({});
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
              // newestLikes: [
              //   {
              //     addedAt: '2022-12-10T20:13:04.965Z',
              //     userId: 'string',
              //     login: 'string',
              //   },
              // ],
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
    const totalCount = await this.postsCollection.countDocuments({
      blogId: blogId,
    });
    const sortPostsId = await this.postsCollection
      .find({ blogId: blogId })
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
              // newestLikes: [
              //   {
              //     addedAt: '2022-12-10T20:13:04.965Z',
              //     userId: 'string',
              //     login: 'string',
              //   },
              // ],
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

  async getQueryUsers(query: any): Promise<UserQueryType> {
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
    return {
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: sortArrayUsers.map((a) => {
        return {
          id: a.id,
          login: a.login,
          email: a.email,
          createdAt: a.createdAt,
        };
      }),
    };
  }

  async getQueryCommentsByPostId(
    query: any,
    postId: string,
  ): Promise<CommentsType | boolean> {
    const totalCount = await this.commentsCollection.countDocuments({
      idPost: postId,
    });
    if (totalCount === 0) {
      return false;
    }
    const sortCommentsByPostId = await this.commentsCollection
      .find({ idPost: postId })
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
}
