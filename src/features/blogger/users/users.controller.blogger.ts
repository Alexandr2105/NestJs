import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QueryRepository } from '../../public/queryReposytories/query.repository';
import { QueryCount } from '../../../common/helper/query.count';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import {
  BanUsersForBlogDto,
  UserIdForBlogDto,
} from './dto/users.for.blogger.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBanStatusForBlogCommand } from './application/useCases/update.ban.status.for.blog.use.case';

@Controller('blogger/users')
export class UsersControllerBlogger {
  constructor(
    protected queryRepository: QueryRepository,
    protected query: QueryCount,
    protected commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(':id/ban')
  async updateBanUser(
    @Body() body: BanUsersForBlogDto,
    @Param() param: UserIdForBlogDto,
  ) {
    await this.commandBus.execute(
      new UpdateBanStatusForBlogCommand(body, param.id),
    );
  }
}
