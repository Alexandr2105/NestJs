import { IQueryRepository } from './i.query.repository';
import {
  AllCommentsForAllPostsCurrentUserBlogs,
  AllQuestionsSa,
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
import { CommentEntity } from '../comments/entity/comment.entity';
import { UserEntity } from '../../sa/users/entity/user.entity';
import { QuizQuestionEntity } from '../../sa/quizQuestions/entity/quiz.question.entity';

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
  ) {
    super();
  }

  async getQueryAllBannedUsersForBlog(
    query: any,
    blogId: string,
    ownerId: string,
  ): Promise<BanUsersInfoForBlog> {
    const blog = await this.blogsRepository.findOneBy({ id: blogId });
    if (blog.userId !== ownerId) throw new ForbiddenException();
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

  async getQueryBlogs(query: any): Promise<BlogsQueryType> {
    const [allBlogs, totalCount] = await this.blogsRepository.findAndCount({
      where: { name: ILike(`%${query.searchNameTerm}%`), banStatus: false },
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
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allBlogs,
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
      items: allBlogs,
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
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allPosts.map((a) => {
        const { likeStatus, ...all } = a;
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
        return {
          ...all,
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
      pagesCount: this.queryCount.pagesCountHelper(totalCount, query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: allPosts.map((a) => {
        const { likeStatus, ...all } = a;
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

  async getQueryAllMyGames(query: any) {}
}
