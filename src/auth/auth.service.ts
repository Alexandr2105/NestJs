import { add } from 'date-fns';
import { UsersRepository } from '../users/users.repository';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid4 } from 'uuid';
import { EmailManager } from '../manager/email-manager';
import { EmailConfirmationDocument } from '../schemas/email.confirmation.schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(EmailManager) protected emailManager: EmailManager,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
  ) {}

  async confirmation(id: string, login: string, email: string) {
    const emailConfirmation = new EmailConfirmationDocument(
      id,
      uuid4(),
      add(new Date(), {
        hours: 1,
        minutes: 3,
      }),
      false,
    );
    await this.usersRepository.createEmailConfirmation(emailConfirmation);
    try {
      await this.emailManager.sendEmailAndConfirm(
        email,
        emailConfirmation.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(code);
    if (!user) return false;
    if (user.isConfirmed) return false;
    if (user.confirmationCode !== code) return false;
    if (user.expirationDate < new Date()) return false;
    return await this.usersRepository.updateEmailConfirmation(user.userId);
  }

  async confirmRecoveryCode(code: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByCode(code);
    if (!user) return false;
    if (user.isConfirmed) return false;
    if (user.confirmationCode !== code) return false;
    return user.expirationDate >= new Date();
  }

  async getNewConfirmationCode(email: string) {
    const newCode = uuid4();
    const updateCode = await this.usersRepository.setConfirm(email, newCode);
    if (updateCode) {
      return newCode;
    }
  }
}
