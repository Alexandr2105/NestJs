import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schema/user';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckOriginalLogin implements ValidatorConstraintInterface {
  constructor(
    @InjectModel('users') protected usersCollection: Model<UserDocument>,
  ) {}

  async validate(login: string): Promise<boolean> {
    const user = await this.usersCollection.findOne({
      $or: [{ login: login }, { email: login }],
    });
    if (user !== null) {
      throw new Error('Такое имя уже существует');
    }
    return true;
  }
}
