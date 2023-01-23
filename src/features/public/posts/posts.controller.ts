import {
  Body,
  Controller,
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
import { QueryRepository } from '../queryReposytories/query.repository';
import { QueryCount } from '../../../common/helper/query.count';
import { Jwt } from '../auth/jwt';
import { UsersRepository } from '../../sa/users/users.repository';
import { CreateCommentDto } from '../comments/dto/comment.dto';
import { LikeStatusDto } from './dto/like.status.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { GetPostIdCommand } from './application/useCase/get.post.id.use.case';
import { CreateCommentByPostCommand } from './application/useCase/create.comment.by.post.use.case';
import { CreateLikeStatusForPostsCommand } from './application/useCase/create.like.status.for.posts.use.case';
import { GetLikesInfoCommand } from '../comments/application/useCase/get.likes.Info.use.case';

@Controller('posts')
export class PostsController {
  constructor(
    protected queryCount: QueryCount,
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    protected queryRepository: QueryRepository,
    protected jwtService: Jwt,
    protected commandBus: CommandBus,
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
    const banUser = await this.usersRepository.getBunUsers();
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
    if (
      post.userId ===
      banUser.map((a) => {
        return a.id;
      })
    )
      throw new NotFoundException();
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
    const post = await this.commandBus.execute(
      new CreateCommentByPostCommand(postId, body.content, user.id, user.login),
    );
    const userId: any = await this.jwtService.getUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    if (post) {
      return await this.commandBus.execute(
        new GetLikesInfoCommand(post.id, userId),
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
