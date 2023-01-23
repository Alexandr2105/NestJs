import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { User, UserDocument } from '../schema/user';
import { LoginDto } from '../../../public/auth/dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  async checkUserOrLogin(body: LoginDto): Promise<User | false> {
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

  async getUserById(id: string): Promise<UserDocument | false> {
    return this.usersRepository.getUserId(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.deleteUser(id);
  }
  async updatePasswordUser(password: string, userId: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByIdAll(userId);
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
