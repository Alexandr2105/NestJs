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
import { UsersService } from './application/users.service';
import { QueryRepository } from '../../public/queryReposytories/query.repository';
import { QueryCount } from '../../../common/helper/query.count';
import { CreateUserDto } from './dto/user.dto';
import { BasicAuthGuard } from '../../../common/guard/basic.auth.guard';
import { CreateUserCommand } from './application/useCases/create.user.use.case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService)
    protected usersService: UsersService,
    protected queryRepository: QueryRepository,
    protected queryCount: QueryCount,
    protected commandBus: CommandBus,
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
    const newUser = await this.commandBus.execute(new CreateUserCommand(body));
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
