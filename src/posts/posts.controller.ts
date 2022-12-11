import { PostsService } from './posts.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { QueryRepository } from '../queryReposytories/query-Repository';
import { QueryCount } from '../helper/query.count';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(QueryCount) protected queryCount: QueryCount,
    // @inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    // @inject(CommentsService) protected commentsService: CommentsService,
    @Inject(QueryRepository) protected queryRepository: QueryRepository, // @inject(JwtService) protected jwtService: JwtService,
  ) {}

  @Get()
  async getPosts(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryPosts(query);
  }

  @Get(':id')
  async getPost(@Param('id') postId: string, @Res() res) {
    const post = await this.postsService.getPostId(postId);
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
  async createPost(@Body() body) {
    const createPost = await this.postsService.createPost(
      body.title,
      body.shortDescription,
      body.content,
      body.blogId,
    );
    if (!createPost) return false; //TODO:Это тоже потом удалить
    return await this.postsService.getPostId(createPost.id);
  }

  @Put(':id')
  async updatePost(@Param('id') postId: string, @Body() body, @Res() res) {
    const postUpdate = await this.postsService.updatePostId(
      postId,
      body.title,
      body.shortDescription,
      body.content,
      body.blogId,
    );
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
  //
  // async createCommentsForPost(req: Request, res: Response) {
  //   const post: any = await this.postsService.creatNewCommentByPostId(
  //     req.params.postId,
  //     req.body.content,
  //     req.user!.id,
  //     req.user!.login,
  //   );
  //   const userId: any = await this.jwtService.getUserIdByToken(
  //     req.headers.authorization!.split(' ')[1],
  //   );
  //   if (post) {
  //     const newPost = await this.commentsService.getLikesInfo(
  //       post.id,
  //       userId.toString(),
  //     );
  //     res.status(201).send(newPost);
  //   } else {
  //     res.sendStatus(404);
  //   }
  // }

  // async createLikeStatusForPost(req: Request, res: Response) {
  //   const postId = await this.postsRepository.getPostId(req.params.postId);
  //   if (!postId) {
  //     res.sendStatus(404);
  //     return;
  //   }
  //   const userId = await this.jwtService.getUserIdByToken(
  //     req.headers.authorization!.split(' ')[1],
  //   );
  //   const user: any = await this.usersRepository.getUserId(userId!.toString());
  //   const likeStatus = await this.postsService.createLikeStatus(
  //     req.params.postId,
  //     userId!.toString(),
  //     req.body.likeStatus,
  //     user.login,
  //   );
  //   if (likeStatus) {
  //     res.sendStatus(204);
  //   }
  // }
}
