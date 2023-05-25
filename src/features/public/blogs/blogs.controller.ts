import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QueryCount } from '../../../common/helper/query.count';
import { Jwt } from '../auth/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { IQueryRepository } from '../queryReposytories/i.query.repository';
import { IBlogsRepository } from './i.blogs.repository';
import { GetBlogIdCommand } from './aplication/useCases/get.blog.id.use.case';
import { CheckBlogId } from '../../blogger/blogs/dto/blogger.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { SubscribeToBlogCommand } from './aplication/useCases/subscribe.to.blog.use.case';
import { UnsubscribeToBlogCommand } from './aplication/useCases/unsubscribe.to.blog.use.case';
import { GetBlogIdSpecialCommand } from './aplication/useCases/get.blog.id.special.use.case';

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
  async getBlogs(@Query() dataQuery, @Headers() header) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    const userId = this.jwtService.getUserIdByToken(
      header.authorization?.split(' ')[1],
    );
    return await this.queryRepository.getQueryBlogs(query, userId);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string, @Headers() header) {
    const blog = await this.commandBus.execute(new GetBlogIdCommand(blogId));
    if (blog && blog.banStatus === false) {
      const userId = this.jwtService.getUserIdByToken(
        header.authorization?.split(' ')[1],
      );
      return await this.commandBus.execute(
        new GetBlogIdSpecialCommand(blogId, userId),
      );
    } else {
      throw new NotFoundException();
    }
  }

  @Get('/:blogId/posts')
  async getPostsForBlog(
    @Param() param: CheckBlogId,
    @Query() dataQuery,
    @Headers() header,
  ) {
    const banBlog = await this.blogsRepository.getBanBlogs(param.blogId);
    if (banBlog) {
      throw new NotFoundException();
    }
    const query = this.queryCount.queryCheckHelper(dataQuery);
    if (header.authorization?.split(' ')[1]) {
      const info: any = this.jwtService.getUserIdByToken(
        header.authorization?.split(' ')[1],
      );
      return await this.queryRepository.getQueryPostsBlogsId(
        query,
        param.blogId,
        info,
      );
    } else {
      return await this.queryRepository.getQueryPostsBlogsId(
        query,
        param.blogId,
        'null',
      );
    }
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('/:blogId/subscription')
  async subscribeUserToBlog(@Param() param: CheckBlogId, @Req() req) {
    await this.commandBus.execute(
      new SubscribeToBlogCommand(param.blogId, req.user.id),
    );
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Delete('/:blogId/subscription')
  async unsubscribeUserToBlog(@Param() param: CheckBlogId, @Req() req) {
    await this.commandBus.execute(
      new UnsubscribeToBlogCommand(param.blogId, req.user.id),
    );
  }
}
