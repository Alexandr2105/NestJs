import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CheckBlogId,
  CreateBlogDto,
  CreatePostForBlogDto,
  UpdateBlogDto,
} from '../public/blogs/dto/blog.dto';
import { QueryRepository } from '../public/queryReposytories/query.repository';
import { QueryCount } from '../../common/helper/query.count';
import { Jwt } from '../public/auth/jwt';
import { JwtAuthGuard } from '../../common/guard/jwt.auth.guard';
import { UpdateBlogUseCase } from '../public/blogs/useCases/update.blog.use.case';
import { DeleteBlogUseCase } from '../public/blogs/useCases/delete.blog.use.case';
import { CreateBlogUseCase } from '../public/blogs/useCases/create.blog.use.case';
import { PostsService } from '../public/posts/posts.service';
import { GetBlogIdUseCase } from '../public/blogs/useCases/get.blog.id.use.case';

@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    @Inject(QueryCount) protected queryCount: QueryCount,
    @Inject(QueryRepository) protected queryRepository: QueryRepository,
    @Inject(Jwt) protected jwtService: Jwt,
    @Inject(UpdateBlogUseCase) protected updateBlogUseCase: UpdateBlogUseCase,
    @Inject(DeleteBlogUseCase) protected deleteBlogUseCase: DeleteBlogUseCase,
    @Inject(CreateBlogUseCase) protected createBlogUseCase: CreateBlogUseCase,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(GetBlogIdUseCase) protected getBlogIdUseCase: GetBlogIdUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getBlogs(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryBlogs(query);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(':id')
  async updateBlog(@Param('id') blogId: string, @Body() body: UpdateBlogDto) {
    const updateBlog = await this.updateBlogUseCase.execute(blogId, body);
    if (updateBlog) {
      return;
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string) {
    const result = await this.deleteBlogUseCase.execute(blogId);
    if (result) {
      return;
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBlog(@Body() body: CreateBlogDto) {
    const createBlog = await this.createBlogUseCase.execute(body);
    return await this.getBlogIdUseCase.execute(createBlog.id);
  }

  @UseGuards(JwtAuthGuard)
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
