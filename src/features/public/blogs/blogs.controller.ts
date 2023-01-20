import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { QueryCount } from '../../../common/helper/query.count';
import { QueryRepository } from '../queryReposytories/query.repository';
import { Jwt } from '../auth/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogIdCommand } from './useCases/get.blog.id.use.case';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected queryCount: QueryCount,
    protected queryRepository: QueryRepository,
    protected jwtService: Jwt,
    protected commandBus: CommandBus,
  ) {}

  @Get()
  async getBlogs(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    const blog = await this.commandBus.execute(new GetBlogIdCommand(blogId));
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
