import { PostsService } from './posts.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { QueryRepository } from '../queryReposytories/query-Repository';
import { QueryCount } from '../helper/query.count';
import { Jwt } from '../application/jwt';
import { UsersRepository } from '../users/users.repository';
import { CommentsService } from '../comments/comments.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { CreateCommentDto } from '../comments/dto/comment.dto';
import { LikeStatusDto } from '../helper/like.status.dto';

//TODO:исправить авторизацию и цдалить @Res;

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
  async getPosts(@Query() dataQuery, @Req() req, @Res() res) {
    let post;
    const query = this.queryCount.queryCheckHelper(dataQuery);
    if (req.headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        req.headers.authorization!.split(' ')[1],
      );
      post = await this.queryRepository.getQueryPosts(query, userId.toString());
    } else {
      post = await this.queryRepository.getQueryPosts(query, 'null');
    }
    res.send(post);
  }

  @Get(':id')
  async getPost(@Param('id') postId: string, @Res() res, @Req() req) {
    let post;
    if (req.headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        req.headers.authorization!.split(' ')[1],
      );
      post = await this.postsService.getPostId(
        req.params.id,
        userId.toString(),
      );
    } else {
      post = await this.postsService.getPostId(req.params.id, 'null');
    }
    if (post) {
      res.send(post);
    } else {
      res.sendStatus(404);
    }
  }

  @Delete(':id')
  async deletePost(@Param('id') postId: string, @Res() res) {
    const post = await this.postsService.deletePostId(postId);
    if (post) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  }

  @Post()
  async createPost(@Body() body: CreatePostDto) {
    const createPost = await this.postsService.createPost(body);
    if (!createPost) return false; //TODO:Это тоже потом удалить
    return await this.postsService.getPostId(createPost.id, 'null');
  }

  @Put(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() body: UpdatePostDto,
    @Res() res,
  ) {
    const postUpdate = await this.postsService.updatePostId(postId, body);
    if (postUpdate) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  }

  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') blogId: string,
    @Query() dataQuery,
    @Res() res,
  ) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    const comments = await this.queryRepository.getQueryCommentsByPostId(
      query,
      blogId,
    );
    if (comments) {
      res.send(comments);
    } else {
      res.sendStatus(404);
    }
  }

  @Post(':postId/comments')
  async createCommentsForPost(
    @Param('postId') postId: string,
    @Body() body: CreateCommentDto,
    @Headers() h,
    @Res() res,
    @Req() req,
  ) {
    const post = await this.postsService.creatNewCommentByPostId(
      postId,
      body.content,
      req.user?.id,
      req.user?.login,
    );
    const userId: any = await this.jwtService.getUserIdByToken(
      h.authorization!.split(' ')[1],
    );
    if (post) {
      const newPost = await this.commentsService.getLikesInfo(
        post.id,
        userId.toString(),
      );
      res.status(201).send(newPost);
    } else {
      res.sendStatus(404);
    }
  }

  @Put(':postId/like-status')
  async createLikeStatusForPost(
    @Param('postId') postId: string,
    @Res() res,
    @Headers() d,
    @Body() body: LikeStatusDto,
  ) {
    const post = await this.postsRepository.getPostId(postId);
    if (!post) {
      res.sendStatus(404);
      return;
    }
    const userId = await this.jwtService.getUserIdByToken(
      d.authorization!.split(' ')[1],
    );
    const user: any = await this.usersRepository.getUserId(userId!.toString());
    const likeStatus = await this.postsService.createLikeStatus(
      postId,
      userId!.toString(),
      body.likeStatus,
      user.login,
    );
    if (likeStatus) {
      res.sendStatus(204);
    }
  }
}
