import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryRepository } from '../queryReposytories/query-Repository';
import { QueryCount } from '../helper/query.count';
import { CreateUserDto } from './dto/user.dto';
import { BasicAuthGuard } from '../guard/basic.auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService)
    protected usersService: UsersService,
    @Inject(QueryRepository) protected queryRepository: QueryRepository,
    @Inject(QueryCount) protected queryCount: QueryCount,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getUsers(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryUsers(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() body: CreateUserDto) {
    const newUser = await this.usersService.creatNewUsers(body);
    return await this.usersService.getUserById(newUser.id);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string) {
    const deleteUser = await this.usersService.deleteUser(userId);
    if (deleteUser) {
      return;
    } else {
      throw new NotFoundException();
    }
  }
}
