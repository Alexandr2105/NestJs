import { PostsService } from './posts.service';
import {
  Body,
  Delete,
  Get,
  Inject,
  Injectable,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { QueryRepository } from '../queryReposytories/query-Repository';
import { QueryCount } from '../helper/query.count';

@Injectable()
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

  @Get()
  async getPost(@Param(':id') postId: string, @Res() res) {
    const post = await this.postsService.getPostId(postId);
    if (post) {
      return post;
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

  // async getCommentsForPost(req: Request, res: Response) {
  //   const query = queryCheckHelper(req.query);
  //   const comments = await this.queryRepository.getQueryCommentsByPostId(
  //     query,
  //     req.params.postId,
  //   );
  //   if (comments) {
  //     res.send(comments);
  //   } else {
  //     res.sendStatus(404);
  //   }
  // }
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
