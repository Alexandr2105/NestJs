import { add } from 'date-fns';
import { UsersRepository } from '../users/users.repository';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid4 } from 'uuid';
import { EmailManager } from '../manager/email-manager';
import { EmailConfirmationDocument } from '../schemas/email.confirmation.schema';
import { RegistrationConformation, EmailResending } from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject(EmailManager) protected emailManager: EmailManager,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(AuthRepository) protected authRepository: AuthRepository,
    @InjectModel('emailConfirmations')
    protected registrationUsersCollection: Model<EmailConfirmationDocument>,
  ) {}

  async confirmation(id: string, body: CreateUserDto) {
    const emailConfirmation = new this.registrationUsersCollection();
    emailConfirmation.id = id;
    emailConfirmation.confirmationCode = uuid4();
    emailConfirmation.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    });
    emailConfirmation.isConfirmed = false;
    await this.authRepository.save(emailConfirmation);
    await this.usersRepository.createEmailConfirmation(emailConfirmation);
    try {
      await this.emailManager.sendEmailAndConfirm(
        body,
        emailConfirmation.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async confirmEmail(body: RegistrationConformation): Promise<boolean> {
    const user: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(body.code);
    if (!user) return false;
    if (user.isConfirmed) return false;
    if (user.confirmationCode !== body.code) return false;
    if (user.expirationDate < new Date()) return false;
    return await this.usersRepository.updateEmailConfirmation(user.userId);
  }

  async confirmRecoveryCode(body: RegistrationConformation): Promise<boolean> {
    const user = await this.usersRepository.getUserByCode(body.code);
    if (!user) return false;
    if (user.isConfirmed) return false;
    if (user.confirmationCode !== body.code) return false;
    return user.expirationDate >= new Date();
  }

  async getNewConfirmationCode(body: EmailResending) {
    const newCode = uuid4();
    const updateCode = await this.usersRepository.setConfirm(body, newCode);
    if (updateCode) {
      return newCode;
    }
  }
}
