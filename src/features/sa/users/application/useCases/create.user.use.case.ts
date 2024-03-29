import { Model } from 'mongoose';
import { User } from '../../schema/user';
import { CreateUserDto } from '../../dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users.service';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler } from '@nestjs/cqrs';
import { IUsersRepository } from '../../i.users.repository';

export class CreateUserCommand {
  constructor(public body: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly usersService: UsersService,
    @InjectModel('users') private readonly usersCollection: Model<User>,
  ) {}

  async execute(command: CreateUserCommand) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.usersService.generateHash(
      command.body.password,
      passwordSalt,
    );
    const newUser = new this.usersCollection(command.body);
    newUser.id = +new Date() + '';
    newUser.password = passwordHash;
    newUser.createdAt = new Date().toISOString();
    newUser.ban = false;
    await this.usersRepository.save(newUser);
    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
      banInfo: { isBanned: newUser.ban, banDate: null, banReason: null },
    };
  }
}
