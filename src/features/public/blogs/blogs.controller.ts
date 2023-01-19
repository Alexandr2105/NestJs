import {
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { QueryCount } from '../../../common/helper/query.count';
import { BlogsService } from './blogs.service';
import { QueryRepository } from '../queryReposytories/query.repository';
import { PostsService } from '../posts/posts.service';
import { Jwt } from '../auth/jwt';
import { GetBlogIdUseCase } from './useCases/get.blog.id.use.case';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject(QueryCount) protected queryCount: QueryCount,
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(QueryRepository) protected queryRepository: QueryRepository,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(Jwt) protected jwtService: Jwt,
    @Inject(GetBlogIdUseCase) protected getBlogIdUseCase: GetBlogIdUseCase,
  ) {}

  @Get()
  async getBlogs(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    const blog = await this.getBlogIdUseCase.execute(blogId);
    if (blog) {
      return blog;
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
      const info: any = this.jwtService.getUserIdByToken(
        header.authorization?.split(' ')[1],
      );
      const post = await this.queryRepository.getQueryPostsBlogsId(
        query,
        blogId,
        info,
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
}
