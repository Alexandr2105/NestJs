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
import { CreateUserDto } from './dto/user.dto';

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

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    const newUser = await this.usersService.creatNewUsers(body);
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
