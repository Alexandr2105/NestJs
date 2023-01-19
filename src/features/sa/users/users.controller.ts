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
import { QueryRepository } from '../../public/queryReposytories/query.repository';
import { QueryCount } from '../../../common/helper/query.count';
import { CreateUserDto } from './dto/user.dto';
import { BasicAuthGuard } from '../../../common/guard/basic.auth.guard';
import { CreateUserUseCase } from './useCases/create.user.use.case';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService)
    protected usersService: UsersService,
    @Inject(QueryRepository) protected queryRepository: QueryRepository,
    @Inject(QueryCount) protected queryCount: QueryCount,
    @Inject(CreateUserUseCase) protected createNewUser: CreateUserUseCase,
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
    const newUser = await this.createNewUser.execute(body);
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
