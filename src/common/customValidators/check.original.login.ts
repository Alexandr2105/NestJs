import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../features/sa/users/i.users.repository';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckOriginalLogin implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async validate(login: string): Promise<boolean> {
    const user = await this.usersRepository.findLoginOrEmail(login);
    return user === undefined || user === null;
  }

  defaultMessage(): string {
    return 'Не верные данные';
  }
}
