import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user';
import { CreateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @InjectModel('users') protected usersCollection: Model<User>,
    @Inject(UsersService) protected usersService: UsersService,
  ) {}

  async execute(body: CreateUserDto): Promise<User> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.usersService.generateHash(
      body.password,
      passwordSalt,
    );
    const newUser = new this.usersCollection(body);
    newUser.id = +new Date() + '';
    newUser.password = passwordHash;
    newUser.createdAt = new Date().toISOString();
    await this.usersRepository.save(newUser);
    return newUser;
  }
}
