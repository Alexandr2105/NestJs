import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { EmailConfirmationDocument } from '../schemas/email.confirmation.schema';
import { UsersRepository } from '../../features/sa/users/users.repository';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckCode implements ValidatorConstraintInterface {
  constructor(protected usersRepository: UsersRepository) {}

  async validate(code: string): Promise<boolean> {
    const user: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(code);
    if (!user) return false;
    if (user.isConfirmed) return false;
    if (user.confirmationCode !== code) return false;
    if (user.expirationDate < new Date()) return false;
    return await this.usersRepository.updateEmailConfirmation(user.userId);
  }

  defaultMessage(): string {
    return 'Не верные данные';
  }
}
