import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';
import { IAuthRepository } from './i.auth.repository';

@Injectable()
export class AuthRepositoryMongo implements IAuthRepository {
  constructor(
    @InjectModel('emailConfirmations')
    protected registrationUsersCollection: Model<EmailConfirmationDocument>,
  ) {}
  async save(emailConfirmationDocument: EmailConfirmationDocument) {
    return await emailConfirmationDocument.save();
  }
}
