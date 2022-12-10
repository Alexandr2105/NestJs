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
import { QueryCount } from '../helper/query.count';
import { BlogsService } from './blogs.service';
import { QueryRepository } from '../queryReposytories/query-Repository';
import { PostsService } from '../posts/posts.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject(QueryCount) protected queryCount: QueryCount,
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(QueryRepository) protected queryRepository: QueryRepository,
    @Inject(PostsService) protected postsService: PostsService,
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
  async createBlog(@Body() body) {
    const createBlog = await this.blogsService.createBlog(
      body.name,
      body.description,
      body.websiteUrl,
    );
    return await this.blogsService.getBlogsId(createBlog.id);
  }

  @Put(':id')
  async updateBlog(@Param('id') blogId: string, @Body() body, @Res() res) {
    const updateBlog = await this.blogsService.updateBlog(
      blogId,
      body.name,
      body.websiteUrl,
      body.description,
    );
    if (updateBlog) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  }

  @Get('/:blogId/posts')
  async getPostsForBlog(
    @Param() blogId: string,
    @Query() dataQuery,
    @Res() res,
  ) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    const postsBlogId = await this.queryRepository.getQueryPostsBlogsId(
      query,
      blogId,
    );
    if (postsBlogId.items.length !== 0) {
      res.send(postsBlogId);
    } else {
      res.sendStatus(404);
    }
  }

  @Post('/:blogId/posts')
  async createPostsForBlog(@Param() blogId: string, @Body() body, @Res() res) {
    const newPostForBlogId = await this.postsService.createPost(
      body.title,
      body.shortDescription,
      body.content,
      blogId,
    );
    if (newPostForBlogId) {
      const newPost = await this.postsService.getPostId(
        newPostForBlogId.id,
        // 'null',
      );
      res.send(newPost);
    } else {
      res.sendStatus(404);
    }
  }
}
