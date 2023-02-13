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
import { QueryCount } from '../../../common/helper/query.count';
import { Jwt } from '../auth/jwt';
import { CreateCommentDto } from '../comments/dto/comment.dto';
import { CheckParamForPosts, PostsDto } from './dto/posts.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { GetPostIdCommand } from './application/useCase/get.post.id.use.case';
import { CreateCommentByPostCommand } from './application/useCase/create.comment.by.post.use.case';
import { CreateLikeStatusForPostsCommand } from './application/useCase/create.like.status.for.posts.use.case';
import { GetLikesInfoCommand } from '../comments/application/useCase/get.likes.Info.use.case';
import { IUsersRepository } from '../../sa/users/i.users.repository';
import { IQueryRepository } from '../queryReposytories/i.query.repository';
import { IBlogsRepository } from '../blogs/i.blogs.repository';
import { IPostsRepository } from './i.posts.repository';
import { CheckPostIdDto } from '../../blogger/blogs/dto/blogger.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly queryCount: QueryCount,
    private readonly usersRepository: IUsersRepository,
    private readonly postsRepository: IPostsRepository,
    private readonly queryRepository: IQueryRepository,
    private readonly jwtService: Jwt,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getPosts(@Query() dataQuery, @Headers() headers) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    if (headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        headers.authorization.split(' ')[1],
      );
      return this.queryRepository.getQueryPosts(query, userId);
    } else {
      return this.queryRepository.getQueryPosts(query, 'null');
    }
  }

  @Get(':id')
  async getPost(@Param('id') postId: string, @Headers() headers) {
    const postInfo = await this.postsRepository.getPostId(postId);
    if (!postInfo) throw new NotFoundException();
    const blog = await this.blogsRepository.getBlogId(postInfo.blogId);
    if (!blog || blog.banStatus === true) throw new NotFoundException();
    const banUsers = await this.usersRepository.getBanUsers();
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
    @Param() param: CheckPostIdDto,
    @Query() dataQuery,
    @Headers() headers,
  ) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    if (headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        headers.authorization.split(' ')[1],
      );
      const query = this.queryCount.queryCheckHelper(dataQuery);
      return this.queryRepository.getQueryCommentsByPostId(
        query,
        param.postId,
        userId,
      );
    } else {
      return this.queryRepository.getQueryCommentsByPostId(
        query,
        param.postId,
        'null',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async createCommentsForPost(
    @Param() param: CheckParamForPosts,
    @Body() body: CreateCommentDto,
    @Headers() headers,
    @Req() req,
  ) {
    const user: any = await this.usersRepository.getUserId(req.user.id);
    const post = await this.postsRepository.getPostId(param.postId);
    const blog: any = await this.blogsRepository.getBlogId(post.blogId);
    const banUsers = await this.blogsRepository.getBanUsersForBlogs(blog.id);
    if (banUsers.find((a) => a.userId === user.id))
      throw new ForbiddenException();
    const comment = await this.commandBus.execute(
      new CreateCommentByPostCommand(
        param.postId,
        body.content,
        user.id,
        user.login,
      ),
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
    @Param() param: CheckParamForPosts,
    @Headers() headers,
    @Body() body: PostsDto,
  ) {
    const post = await this.postsRepository.getPostId(param.postId);
    if (!post) {
      throw new NotFoundException();
    }
    const userId = await this.jwtService.getUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    const user: any = await this.usersRepository.getUserId(userId);
    const likeStatus = await this.commandBus.execute(
      new CreateLikeStatusForPostsCommand(
        param.postId,
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
