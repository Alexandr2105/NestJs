import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { QueryRepository } from '../../public/queryReposytories/query.repository';
import { BasicAuthGuard } from '../../../common/guard/basic.auth.guard';
import { QueryCount } from '../../../common/helper/query.count';
import { BlogsSaDto } from './dto/blogs.sa.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBlogOwnerCommand } from './aplication/useCase/update.blog.owner.use.case';

@Controller('sa/blogs')
export class BlogsControllerSa {
  constructor(
    protected queryRepository: QueryRepository,
    protected queryCount: QueryCount,
    protected commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllBlogs(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return this.queryRepository.getQueryBlogsSA(query);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id/bind-with-user/:userId')
  async updateBlogOwner(@Param() param: BlogsSaDto) {
    await this.commandBus.execute(new UpdateBlogOwnerCommand(param));
  }

  // @Put(':id/ban')
  // async updateBanStatusForBlog(
  //   @Body() body: BanStatusForBlogDto,
  //   @Param() param: CheckBlogIdDto,
  // ) {
  //
  // }
}
