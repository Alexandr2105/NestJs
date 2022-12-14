import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemsUsers } from '../helper/allTypes';
import { add } from 'date-fns';
import { User, UserDocument } from './schema/user';
import { EmailConfirmationDocument } from '../schemas/email.confirmation.schema';
import { EmailResending } from '../auth/dto/auth.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel('users') protected usersCollection: Model<User>,
    @InjectModel('emailConfirmations')
    protected registrationUsersCollection: Model<EmailConfirmationDocument>,
  ) {}

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.usersCollection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async findLoginOrEmail(logOrEmail: string): Promise<ItemsUsers | null> {
    return this.usersCollection.findOne({
      $or: [{ login: logOrEmail }, { email: logOrEmail }],
    });
  }

  async getUserId(id: string): Promise<UserDocument | false> {
    const user = await this.usersCollection
      .findOne({ id: id })
      .select('id login email createdAt -_id');
    if (!user) return false;
    return user;
  }

  async createEmailConfirmation(emailConf: EmailConfirmationDocument) {
    await this.registrationUsersCollection.create(emailConf);
  }

  async updateEmailConfirmation(id: string): Promise<boolean> {
    const result = await this.registrationUsersCollection.updateOne(
      { userId: id },
      { $set: { isConfirmed: true } },
    );
    return result.matchedCount === 1;
  }

  async getUserByCode(code: string): Promise<EmailConfirmationDocument> {
    const idUser = await this.registrationUsersCollection.findOne({
      confirmationCode: code,
    });
    if (idUser) {
      return idUser;
    }
  }

  async setConfirm(body: EmailResending, newCode: string): Promise<boolean> {
    const user: any = await this.usersCollection.findOne({ email: body.email });
    const checkUserEmailConfirmation =
      await this.registrationUsersCollection.findOne({
        userId: user?.id,
      });
    if (checkUserEmailConfirmation) {
      const result = await this.registrationUsersCollection.updateOne(
        { userId: user?.id },
        { $set: { confirmationCode: newCode } },
      );
      return result.matchedCount === 1;
    } else {
      await this.registrationUsersCollection.create({
        userId: user?.id,
        confirmationCode: newCode,
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: false,
      });
      return true;
    }
  }

  async getUserByIdAll(id: string) {
    return this.usersCollection.findOne({ id: id });
  }

  async save(user: UserDocument) {
    await user.save();
  }
}
