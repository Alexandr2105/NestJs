import { PostsService } from './posts.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Inject,
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
import { CommentsService } from '../comments/comments.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { CreateCommentDto } from '../comments/dto/comment.dto';
import { LikeStatusDto } from '../../../common/helper/like.status.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { BasicAuthGuard } from '../../../common/guard/basic.auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(QueryCount) protected queryCount: QueryCount,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(CommentsService) protected commentsService: CommentsService,
    @Inject(QueryRepository) protected queryRepository: QueryRepository,
    @Inject(Jwt) protected jwtService: Jwt,
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
    let post;
    if (headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        headers.authorization.split(' ')[1],
      );
      post = await this.postsService.getPostId(postId, userId);
    } else {
      post = await this.postsService.getPostId(postId, 'null');
    }
    if (post) {
      return post;
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    const post = await this.postsService.deletePostId(postId);
    if (post) {
      return;
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() body: CreatePostDto) {
    const createPost = await this.postsService.createPost(body);
    if (!createPost) return false;
    return await this.postsService.getPostId(createPost.id, 'null');
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Put(':id')
  async updatePost(@Param('id') postId: string, @Body() body: UpdatePostDto) {
    const postUpdate = await this.postsService.updatePostId(postId, body);
    if (postUpdate) {
      return;
    } else {
      throw new NotFoundException();
    }
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
  @HttpCode(201)
  @Post(':postId/comments')
  async createCommentsForPost(
    @Param('postId') postId: string,
    @Body() body: CreateCommentDto,
    @Headers() headers,
    @Req() req,
  ) {
    const user: any = await this.usersRepository.getUserId(req.user.id);
    const post = await this.postsService.creatNewCommentByPostId(
      postId,
      body.content,
      user.id,
      user.login,
    );
    const userId: any = await this.jwtService.getUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    if (post) {
      return await this.commentsService.getLikesInfo(post.id, userId);
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
    const likeStatus = await this.postsService.createLikeStatus(
      postId,
      userId,
      body.likeStatus,
      user.login,
    );
    if (likeStatus) {
      return;
    }
  }
}