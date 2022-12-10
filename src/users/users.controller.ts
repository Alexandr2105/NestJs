import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryRepository } from '../queryReposytories/query-Repository';
import { QueryCount } from '../helper/query.count';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService)
    protected usersService: UsersService,
    @Inject(QueryRepository) protected queryRepository: QueryRepository,
    @Inject(QueryCount) protected queryCount: QueryCount,
  ) {}

  @Get()
  async getUsers(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryUsers(query);
  }

  @Post(':id')
  async createUser(@Param('id') userId: string, @Body() body) {
    const newUser = await this.usersService.creatNewUsers(
      body.login,
      body.email,
      body.password,
    );
    return await this.usersService.getUserById(newUser.id);
  }

  @Delete(':id')
  async deleteUser(@Param('id') userId: string, @Res() res) {
    const deleteUser = await this.usersService.deleteUser(userId);
    if (deleteUser) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  }
}
