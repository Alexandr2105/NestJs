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
  Req,
  Res,
} from '@nestjs/common';
import { QueryCount } from '../helper/query.count';
import { BlogsService } from './blogs.service';
import { QueryRepository } from '../queryReposytories/query-Repository';
import { PostsService } from '../posts/posts.service';
import { JwtService } from '../application/jwt-service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blogDto';
import { CreatePostDto } from '../posts/dto/postDto';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject(QueryCount) protected queryCount: QueryCount,
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(QueryRepository) protected queryRepository: QueryRepository,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(JwtService) protected jwtService: JwtService,
  ) {}

  @Get()
  async getBlogs(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string, @Res() res) {
    const blog = await this.blogsService.getBlogsId(blogId);
    if (blog) {
      res.send(blog);
    } else {
      res.sendStatus(404);
    }
  }

  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string, @Res() res) {
    const result = await this.blogsService.deleteBlogsId(blogId);
    if (result) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  }

  @Post()
  async createBlog(@Body() body: CreateBlogDto) {
    const createBlog = await this.blogsService.createBlog(body);
    return await this.blogsService.getBlogsId(createBlog.id);
  }

  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() body: UpdateBlogDto,
    @Res() res,
  ) {
    const updateBlog = await this.blogsService.updateBlog(blogId, body);
    if (updateBlog) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  }

  @Get('/:blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() dataQuery,
    @Res() res,
    @Req() req,
  ) {
    let postsBlogId;
    const query = this.queryCount.queryCheckHelper(dataQuery);
    if (req.headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        req.headers.authorization!.split(' ')[1],
      );
      postsBlogId = await this.queryRepository.getQueryPostsBlogsId(
        query,
        req.params.blogId,
        userId,
      );
    } else {
      postsBlogId = await this.queryRepository.getQueryPostsBlogsId(
        query,
        req.params.blogId,
        'null',
      );
    }
    if (postsBlogId.items.length !== 0) {
      res.send(postsBlogId);
    } else {
      res.sendStatus(404);
    }
  }

  @Post('/:blogId/posts')
  async createPostsForBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostDto,
    @Res() res,
  ) {
    const newPostForBlogId = await this.postsService.createPost(body);
    if (newPostForBlogId) {
      const newPost = await this.postsService.getPostId(
        newPostForBlogId.id,
        'null',
      );
      res.send(newPost);
    } else {
      res.sendStatus(404);
    }
  }
}
