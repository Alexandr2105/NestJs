import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailConfirmationDocument } from '../schemas/email.confirmation.schema';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel('emailConfirmations')
    protected registrationUsersCollection: Model<EmailConfirmationDocument>,
  ) {}
  async save(emailConfirmationDocument: EmailConfirmationDocument) {
    await emailConfirmationDocument.save();
  }
}
