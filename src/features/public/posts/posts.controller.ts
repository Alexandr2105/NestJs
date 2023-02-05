import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { QueryCount } from '../../../common/helper/query.count';
import { Jwt } from '../auth/jwt';
import { CreateCommentDto } from '../comments/dto/comment.dto';
import { LikeStatusDto } from './dto/like.status.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { GetPostIdCommand } from './application/useCase/get.post.id.use.case';
import { CreateCommentByPostCommand } from './application/useCase/create.comment.by.post.use.case';
import { CreateLikeStatusForPostsCommand } from './application/useCase/create.like.status.for.posts.use.case';
import { GetLikesInfoCommand } from '../comments/application/useCase/get.likes.Info.use.case';
import { BlogsRepositoryMongo } from '../blogs/blogs.repository.mongo';
import { IUsersRepository } from '../../sa/users/i.users.repository';
import { QueryRepositorySql } from '../queryReposytories/query.repository.sql';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly blogsRepository: BlogsRepositoryMongo,
    private readonly queryCount: QueryCount,
    private readonly usersRepository: IUsersRepository,
    private readonly postsRepository: PostsRepository,
    private readonly queryRepository: QueryRepositorySql,
    private readonly jwtService: Jwt,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getPosts(@Query() dataQuery, @Headers() headers) {
    let post;
    const query = this.queryCount.queryCheckHelper(dataQuery);
    if (headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        headers.authorization.split(' ')[1],
      );
      post = await this.queryRepository.getQueryPosts(query, userId);
    } else {
      post = await this.queryRepository.getQueryPosts(query, 'null');
    }
    return post;
  }

  @Get(':id')
  async getPost(@Param('id') postId: string, @Headers() headers) {
    const postInfo = await this.postsRepository.getPostId(postId);
    if (!postInfo) throw new NotFoundException();
    const blog = await this.blogsRepository.getBlogId(postInfo.blogId);
    if (!blog || blog.banStatus === true) throw new NotFoundException();
    const banUsers = await this.usersRepository.getBunUsers();
    let post;
    if (headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        headers.authorization.split(' ')[1],
      );
      post = await this.commandBus.execute(
        new GetPostIdCommand(postId, userId),
      );
    } else {
      post = await this.commandBus.execute(
        new GetPostIdCommand(postId, 'null'),
      );
    }
    if (!post) throw new NotFoundException();
    banUsers.map((a) => {
      if (post.userId === a.id) throw new NotFoundException();
    });
    return post;
  }

  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') blogId: string,
    @Query() dataQuery,
  ) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    const comments = await this.queryRepository.getQueryCommentsByPostId(
      query,
      blogId,
    );
    if (comments) {
      return comments;
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async createCommentsForPost(
    @Param('postId') postId: string,
    @Body() body: CreateCommentDto,
    @Headers() headers,
    @Req() req,
  ) {
    const user: any = await this.usersRepository.getUserId(req.user.id);
    const post = await this.postsRepository.getPostId(postId);
    const blog: any = await this.blogsRepository.getBlogId(post.blogId);
    const banUsers = await this.blogsRepository.getBanUsersForBlogs(blog.id);
    if (banUsers.find((a) => a.userId === user.id))
      throw new ForbiddenException();
    const comment = await this.commandBus.execute(
      new CreateCommentByPostCommand(postId, body.content, user.id, user.login),
    );
    const userId: any = await this.jwtService.getUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    if (comment) {
      return await this.commandBus.execute(
        new GetLikesInfoCommand(comment.id, userId),
      );
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(':postId/like-status')
  async createLikeStatusForPost(
    @Param('postId') postId: string,
    @Headers() headers,
    @Body() body: LikeStatusDto,
  ) {
    const post = await this.postsRepository.getPostId(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const userId = await this.jwtService.getUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    const user: any = await this.usersRepository.getUserId(userId);
    const likeStatus = await this.commandBus.execute(
      new CreateLikeStatusForPostsCommand(
        postId,
        userId,
        body.likeStatus,
        user.login,
      ),
    );
    if (likeStatus) {
      return;
    }
  }
}
