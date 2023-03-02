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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../blogs/entity/blog.entity';
import { Repository } from 'typeorm';
import { QueryCount } from '../../../common/helper/query.count';
import { PostEntity } from '../posts/entity/post.entity';
import { IUsersRepository } from '../../sa/users/i.users.repository';

@Injectable()
export class QueryRepositoryTypeorm extends IQueryRepository {
  constructor(
    private readonly queryCount: QueryCount,
    private readonly usersRepository: IUsersRepository,
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
  ) {
    super();
  }

  async getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
    ownerId: string,
  ): Promise<BanUsersInfoForBlog> {
    return Promise.resolve(undefined);
  }

  async getQueryAllInfoForBlog(
    query: any,
    userId: string,
  ): Promise<AllCommentsForAllPostsCurrentUserBlogs> {
    return Promise.resolve(undefined);
  }

  async getQueryAllUsers(query: any): Promise<UserQueryType> {
    return Promise.resolve(undefined);
  }

  async getQueryBlogs(query: any): Promise<BlogsQueryType> {
    const allBlogs = await this.blogsRepository.find({
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
    return Promise.resolve(undefined);
  }

  async getQueryBlogsSA(query: any): Promise<BlogsQueryTypeSA> {
    return Promise.resolve(undefined);
  }

  async getQueryCommentsByPostId(
    query: any,
    postId: string,
    userId: string,
  ): Promise<CommentsType | boolean> {
    return Promise.resolve(undefined);
  }

  async getQueryPosts(query: any, userId: string): Promise<PostQueryType> {
    return Promise.resolve(undefined);
  }

  async getQueryPostsBlogsId(query: any, blogId: string, userId: string) {
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
      },
      relations: { likeStatus: true },
      order: { [query.sortBy]: query.sortDirection },
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
        const sort = a.likeStatus.sort((a, b) => {
          return b.createDate.localeCompare(a.createDate);
        });
        const newestLikes = sort.splice(0, 3).map((a) => {
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
