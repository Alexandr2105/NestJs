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
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../blogs/entity/blog.entity';
import { ILike, Repository } from 'typeorm';
import { QueryCount } from '../../../common/helper/query.count';
import { PostEntity } from '../posts/entity/post.entity';
import { IUsersRepository } from '../../sa/users/i.users.repository';
import { CommentEntity } from '../comments/entity/comment.entity';
import { UserEntity } from '../../sa/users/entity/user.entity';

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
  ) {
    super();
  }

  async getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
    ownerId: string,
  ): Promise<BanUsersInfoForBlog> {
    const blog = await this.blogsRepository.findOneBy({ userId: ownerId });
    if (!blog) throw new ForbiddenException();
    const user = await this.usersRepository.find({
      where: {
        banInfoForBlogs: { isBanned: true },
        login: ILike(`%${query.searchNameTerm}%`),
      },
      select: {
        id: true,
        login: true,
        createdAt: true,
        banInfoForBlogs: { isBanned: true, banDate: true, banReason: true },
      },
      relations: { blogs: true, banInfoForBlogs: true },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(user.length, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: user.length,
      items: user.map((a) => {
        return {
          id: a.id,
          login: a.login,
          banInfo: a.banInfoForBlogs[0],
        };
      }),
    };
  }

  async getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs> {
    const info = await this.commentsRepository.find({
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
      pagesCount: this.queryCount.pagesCountHelper(info.length, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: info.length,
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
    return Promise.resolve(undefined);
  }

  async getQueryBlogs(query: any): Promise<BlogsQueryType> {
    const allBlogs = await this.blogsRepository.find({
      where: { name: ILike(`%${query.searchNameTerm}%`) },
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
      },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(
        allBlogs.length,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: allBlogs.length,
      items: allBlogs,
    };
  }

  async getQueryBlogsAuthUser(
    query: any,
    userId: string,
  ): Promise<BlogsQueryType> {
    const allBlogs = await this.blogsRepository.find({
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
      },
      order: { [query.sortBy]: query.sortDirection },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(
        allBlogs.length,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: allBlogs.length,
      items: allBlogs,
    };
  }

  async getQueryBlogsSA(query: any): Promise<BlogsQueryTypeSA> {
    return Promise.resolve(undefined);
  }

  async getQueryCommentsByPostId(
    query: any,
    postId: string,
    userId: string,
  ): Promise<CommentsType | boolean> {
    const comments = await this.commentsRepository.find({
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
      pagesCount: this.queryCount.pagesCountHelper(
        comments.length,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: comments.length,
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
    const allPosts = await this.postsRepository.find({
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
        likeStatus: { userId: true, status: true, createDate: true },
      },
      relations: { likeStatus: true },
      order: {
        [query.sortBy]: query.sortDirection,
        likeStatus: { createDate: 'DESC' },
      },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(
        allPosts.length,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: allPosts.length,
      items: allPosts.map((a) => {
        const like = a.likeStatus.filter((l) => l.status === 'Like');
        const dislike = a.likeStatus.filter((d) => d.status === 'Dislike');
        const myStatus = a.likeStatus.find((m) => m.userId === userId);
        const newestLikes = a.likeStatus.splice(0, 3).map((a) => {
          return {
            addedAt: a.createDate,
            userId: a.userId,
            login: a.login,
          };
        });
        return {
          id: a.id,
          title: a.title,
          shortDescription: a.shortDescription,
          content: a.content,
          blogId: a.blogId,
          blogName: a.blogName,
          createdAt: a.createdAt,
          extendedLikesInfo: {
            likesCount: like.length,
            dislikesCount: dislike.length,
            myStatus: myStatus?.status === undefined ? 'None' : myStatus.status,
            newestLikes: newestLikes,
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
    const allPost = await this.postsRepository.find({
      where: { blogId: blogId, user: { ban: false } },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        blogId: true,
        blogName: true,
        createdAt: true,
        likeStatus: { status: true, userId: true, createDate: true },
      },
      relations: { likeStatus: true },
      order: {
        [query.sortBy]: query.sortDirection,
        likeStatus: { createDate: 'DESC' },
      },
      skip: this.queryCount.skipHelper(query.pageNumber, query.pageSize),
      take: query.pageSize,
    });
    return {
      pagesCount: this.queryCount.pagesCountHelper(
        allPost.length,
        query.pageSize,
      ),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: allPost.length,
      items: allPost.map((a) => {
        const like = a.likeStatus.filter((l) => l.status === 'Like');
        const dislike = a.likeStatus.filter((d) => d.status === 'Dislike');
        const myStatus = a.likeStatus.find((m) => m.userId === userId);
        const newestLikes = a.likeStatus.splice(0, 3).map((a) => {
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
          id: a.id,
          title: a.title,
          shortDescription: a.shortDescription,
          content: a.content,
          blogId: a.blogId,
          blogName: a.blogName,
          createdAt: a.createdAt,
          extendedLikesInfo,
        };
      }),
    };
  }

  async getQuerySortUsers(query: any): Promise<UserQueryType> {
    return Promise.resolve(undefined);
  }

  async returnObject(query, totalCount, sortArrayUsers) {}
}
