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
import { QueryCount } from '../../../common/helper/query.count';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import {
  BanUsersForBlogDto,
  CheckIdForBlogBanUser,
  UserIdForBlogDto,
} from './dto/users.for.blogger.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBanStatusForBlogCommand } from './application/useCases/update.ban.status.for.blog.use.case';
import { IQueryRepository } from '../../public/queryReposytories/i.query.repository';

@Controller('blogger/users')
export class UsersControllerBlogger {
  constructor(
    private readonly queryRepository: IQueryRepository,
    private readonly query: QueryCount,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('blog/:id')
  async getAllBannedUsersForBlog(
    @Query() queryData,
    @Req() req,
    @Param() param: CheckIdForBlogBanUser,
  ) {
    const query = this.query.queryCheckHelper(queryData);
    return await this.queryRepository.getQueryAllBannedUsersForBlog(
      query,
      param.blogId,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(':id/ban')
  async updateBanUser(
    @Body() body: BanUsersForBlogDto,
    @Param() param: UserIdForBlogDto,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdateBanStatusForBlogCommand(body, param.id, req.user.id),
    );
  }
}
