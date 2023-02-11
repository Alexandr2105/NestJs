import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { QueryCount } from '../../../common/helper/query.count';
import { Jwt } from '../auth/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogIdCommand } from './aplication/useCases/get.blog.id.use.case';
import { IQueryRepository } from '../queryReposytories/i.query.repository';
import { IBlogsRepository } from './i.blogs.repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly queryCount: QueryCount,
    private readonly queryRepository: IQueryRepository,
    private readonly jwtService: Jwt,
    private readonly commandBus: CommandBus,
    private readonly blogsRepository: IBlogsRepository,
  ) {}

  @Get()
  async getBlogs(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    const blog = await this.commandBus.execute(new GetBlogIdCommand(blogId));
    if (blog && blog.banStatus === false) {
      return await this.blogsRepository.getBlogIdSpecial(blogId);
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
    const banBlog = await this.blogsRepository.getBanBlogs(blogId);
    if (banBlog) {
      throw new NotFoundException();
    }
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
