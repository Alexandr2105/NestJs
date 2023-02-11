import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IUsersRepository } from '../../features/sa/users/i.users.repository';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckEmailConfirmation implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByEmail(email);
    if (user === null || user === undefined) {
      return false;
    }
    const conf = await this.usersRepository.getConfByUserId(user.id);
    return !conf?.isConfirmed;
  }

  defaultMessage(): string {
    return 'Не верные данные';
  }
}
