import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { QueryRepository } from '../../public/queryReposytories/query.repository';
import { QueryCount } from '../../../common/helper/query.count';

@Controller('blogger/users')
export class UsersControllerBlogger {
  constructor(
    protected queryRepository: QueryRepository,
    protected query: QueryCount,
  ) {}

  @Get('blog/:id')
  async getAllBannedUsersForBlog(
    @Query() queryData,
    @Req() req,
    @Param() param,
  ) {
    const query = this.query.queryCheckHelper(queryData);
    return await this.queryRepository.getQueryAllBannedUsersForBlog(
      query,
      param.id,
    );
  }

  // @Put(':id/ban')
  // async updateBanUser() {}
}
