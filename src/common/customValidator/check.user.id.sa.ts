import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../../features/sa/users/i.users.repository';

@ValidatorConstraint({ name: 'blog', async: true })
@Injectable()
export class CheckUserIdSa implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async validate(userId: any): Promise<boolean> {
    const user = await this.usersRepository.getUserId(userId);
    if (!user) throw new NotFoundException();
    return true;
  }
}
