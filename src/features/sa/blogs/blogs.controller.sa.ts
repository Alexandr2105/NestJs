import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { QueryRepository } from '../../public/queryReposytories/query.repository';
import { BasicAuthGuard } from '../../../common/guard/basic.auth.guard';
import { QueryCount } from '../../../common/helper/query.count';
import { BlogsSaDto } from './dto/blogs.sa.dto';

@Controller('blogs')
export class BlogsControllerSa {
  constructor(
    protected queryRepository: QueryRepository,
    protected queryCount: QueryCount,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllBlogs(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return this.queryRepository.getQueryBlogsSA(query);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id/bind-with-user/:userId')
  async updateBlogOwner(@Param() param: BlogsSaDto) {}
}
