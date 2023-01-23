import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../features/sa/users/users.repository';

@ValidatorConstraint({ name: 'blog', async: true })
@Injectable()
export class CheckUserIdSa implements ValidatorConstraintInterface {
  constructor(protected usersRepository: UsersRepository) {}

  async validate(userId: any): Promise<boolean> {
    const user = await this.usersRepository.getUserId(userId);
    return !!user;
  }

  defaultMessage(): string {
    return 'Нет такого пользователя';
  }
}
