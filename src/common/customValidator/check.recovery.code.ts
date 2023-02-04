import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../features/sa/users/i.users.repository';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckRecoveryCode implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async validate(code: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByCode(code);
    if (!user) return false;
    if (user.isConfirmed) return false;
    if (user.confirmationCode !== code) return false;
    return user.expirationDate >= new Date();
  }

  defaultMessage(): string {
    return 'Не верные данные';
  }
}
