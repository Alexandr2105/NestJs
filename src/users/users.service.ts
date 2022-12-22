import * as bcrypt from 'bcrypt';
import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './schema/user';
import { CreateUserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from '../auth/dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @InjectModel('users') protected usersCollection: Model<User>,
  ) {}

  async creatNewUsers(body: CreateUserDto): Promise<User> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.generateHash(body.password, passwordSalt);
    const newUser = new this.usersCollection(body);
    newUser.id = +new Date() + '';
    newUser.password = passwordHash;
    newUser.createdAt = new Date().toISOString();
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async checkUserOrLogin(body: LoginDto): Promise<User | boolean> {
    const user: any = await this.usersRepository.findLoginOrEmail(
      body.loginOrEmail,
    );
    if (!user) return false;
    const hashPassword = await this.generateHash(body.password, user.password);
    if (user.password === hashPassword) {
      return user;
    } else {
      return false;
    }
  }

  async generateHash(pass: string, salt: string) {
    return bcrypt.hash(pass, salt);
  }

  async getUserById(id: string) {
    return this.usersRepository.getUserId(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.deleteUser(id);
  }
  async updatePasswordUser(password: string, userId: string): Promise<boolean> {
    const user = await this.usersRepository.getUserId(userId);
    if (!user) return false;
    user.password = password;
    await this.usersRepository.save(user);
  }

  async createNewPassword(newPassword: string, userId: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.generateHash(newPassword, passwordSalt);
    return await this.updatePasswordUser(passwordHash, userId);
  }
}
