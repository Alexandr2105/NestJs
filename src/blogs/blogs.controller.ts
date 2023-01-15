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
  UseGuards,
} from '@nestjs/common';
import { QueryCount } from '../helper/query.count';
import { BlogsService } from './blogs.service';
import { QueryRepository } from '../queryReposytories/query-Repository';
import { PostsService } from '../posts/posts.service';
import { Jwt } from '../application/jwt';
import {
  CheckBlogId,
  CreateBlogDto,
  CreatePostForBlogDto,
  UpdateBlogDto,
} from './dto/blog.dto';
import { BasicAuthGuard } from '../guard/basic.auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject(QueryCount) protected queryCount: QueryCount,
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(QueryRepository) protected queryRepository: QueryRepository,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(Jwt) protected jwtService: Jwt,
  ) {}

  @Get()
  async getBlogs(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    const blog = await this.blogsService.getBlogsId(blogId);
    if (blog) {
      return blog;
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string) {
    const result = await this.blogsService.deleteBlogsId(blogId);
    if (result) {
      return;
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() body: CreateBlogDto) {
    const createBlog = await this.blogsService.createBlog(body);
    return await this.blogsService.getBlogsId(createBlog.id);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Put(':id')
  async updateBlog(@Param('id') blogId: string, @Body() body: UpdateBlogDto) {
    const updateBlog = await this.blogsService.updateBlog(blogId, body);
    if (updateBlog) {
      return;
    } else {
      throw new NotFoundException();
    }
  }

  @Get('/:blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() dataQuery,
    @Headers() header,
  ) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    if (header.authorization?.split(' ')[1]) {
      const info: any = this.jwtService.getUserByRefreshToken(
        header.authorization?.split(' ')[1],
      );
      const post = await this.queryRepository.getQueryPostsBlogsId(
        query,
        blogId,
        info?.userId,
      );
      if (post.items.length === 0) throw new NotFoundException();
      return post;
    } else {
      const post = await this.queryRepository.getQueryPostsBlogsId(
        query,
        blogId,
        'null',
      );
      if (post.items.length === 0) throw new NotFoundException();
      return post;
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post('/:blogId/posts')
  async createPostsForBlog(
    @Param() param: CheckBlogId,
    @Body() body: CreatePostForBlogDto,
  ) {
    const newPostForBlogId = await this.postsService.createPost({
      blogId: param.blogId,
      title: body.title,
      content: body.content,
      shortDescription: body.shortDescription,
    });
    if (newPostForBlogId) {
      return await this.postsService.getPostId(newPostForBlogId.id, 'null');
    } else {
      throw new NotFoundException();
    }
  }
}
