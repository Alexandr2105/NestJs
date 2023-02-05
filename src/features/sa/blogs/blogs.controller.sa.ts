import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../common/guard/basic.auth.guard';
import { QueryCount } from '../../../common/helper/query.count';
import {
  BanStatusForBlogDto,
  BlogsSaDto,
  CheckBlogIdDto,
} from './dto/blogs.sa.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBlogOwnerCommand } from './aplication/useCase/update.blog.owner.use.case';
import { UpdateBanStatusForBlogSaCommand } from './aplication/useCase/update.ban.status.for.blog.sa.use.case';
import { IQueryRepository } from '../../public/queryReposytories/i.query.repository';

@Controller('sa/blogs')
export class BlogsControllerSa {
  constructor(
    private readonly queryRepository: IQueryRepository,
    private readonly queryCount: QueryCount,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllBlogs(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return this.queryRepository.getQueryBlogsSA(query);
  }

  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  @Put('/:id/bind-with-user/:userId')
  async updateBlogOwner(@Param() param: BlogsSaDto) {
    await this.commandBus.execute(new UpdateBlogOwnerCommand(param));
  }

  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  @Put(':id/ban')
  async updateBanStatusForBlog(
    @Body() body: BanStatusForBlogDto,
    @Param() param: CheckBlogIdDto,
  ) {
    await this.commandBus.execute(
      new UpdateBanStatusForBlogSaCommand(body.isBanned, param.id),
    );
  }
}
