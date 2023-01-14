import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schema/user';
import { EmailConfirmationDocument } from '../schemas/email.confirmation.schema';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckEmailConfirmation implements ValidatorConstraintInterface {
  constructor(
    @InjectModel('users') protected usersCollection: Model<UserDocument>,
    @InjectModel('emailConfirmations')
    protected registrationUsersCollection: Model<EmailConfirmationDocument>,
  ) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.usersCollection.findOne({ email: email });
    if (user === null) {
      throw new Error('Такого email не существует');
    }
    const conf = await this.registrationUsersCollection.findOne({
      userId: user?.id,
    });
    if (conf?.isConfirmed) {
      throw new Error('Email уже поттверждён');
    }
    return true;
  }
}
