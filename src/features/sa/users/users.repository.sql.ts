import { IUsersRepository } from './i.users.repository';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';
import { UserDocument } from './schema/user';
import { BanUsersDocument } from './schema/banUsers';
import { EmailResending } from '../../public/auth/dto/auth.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { add } from 'date-fns';

export class UsersRepositorySql implements IUsersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async deleteBanUsers(userId: string) {
    await this.dataSource.query(
      `DELETE FROM public."BanUsers"
             WHERE "userId"=$1`,
      [userId],
    );
  }

  async deleteUser(id: string): Promise<boolean> {
    const info = await this.dataSource.query(
      `DELETE FROM public."Users"
            WHERE "id"=$1`,
      [id],
    );
    return info.deletedCount === 1;
  }

  async findLoginOrEmail(logOrEmail: string): Promise<UserDocument> {
    const loginOrEmail = await this.dataSource.query(
      `SELECT * FROM public."Users"
            WHERE "login"=$1 OR "email"=$2`,
      [logOrEmail, logOrEmail],
    );
    return loginOrEmail[0];
  }

  async getBunUsers() {
    return await this.dataSource.query(
      `SELECT * FROM public."Users"
            WHERE "ban"=$1`,
      [true],
    );
  }

  async getUserByCode(code: string): Promise<EmailConfirmationDocument> {
    const user = await this.dataSource.query(
      `SELECT * FROM public."EmailConfirmations"
            WHERE "confirmationCode"=$1`,
      [code],
    );
    return user[0];
  }

  async getUserByIdAll(id: string) {
    const user = await this.dataSource.query(
      `SELECT * FROM public."Users"
            WHERE "id"=$1`,
      [id],
    );
    return user[0];
  }

  async getUserId(id: string): Promise<UserDocument | false> {
    const user = await this.dataSource.query(
      `SELECT "id","login","email","createdAt" FROM public."Users"
            WHERE "id"=$1`,
      [id],
    );
    return user[0];
  }

  async save(user: UserDocument) {
    await this.dataSource.query(
      `SELECT * FROM public."Users"
           ("id", "login", "password", "email", "createdAt", "ban")
            VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        user.login,
        user.password,
        user.email,
        user.createdAt,
        user.ban,
      ],
    );
  }

  async saveBan(banInfo: BanUsersDocument) {
    await this.dataSource.query(
      `SELECT * FROM public."BanUsers"
           ("userId", "isBanned", "banReason", "banDate")
            VALUES ($1, $2, $3, $4)`,
      [banInfo.userId, banInfo.isBanned, banInfo.banReason, banInfo.banDate],
    );
  }

  async setConfirm(body: EmailResending, newCode: string): Promise<boolean> {
    const user = await this.dataSource.query(
      `SELECT * FROM public."Users"
            WHERE "email"=$1`,
      [body.email],
    );
    const checkUserEmailConfirmation = await this.dataSource.query(
      `SELECT * FROM public."EmailConfirmations"
            WHERE "userId"=$1`,
      [user?.id],
    );
    if (checkUserEmailConfirmation) {
      const result = await this.dataSource.query(
        `UPDATE public."EmailConfirmations"
            SET "confirmationCode"=$1
            WHERE "userId"=$2`,
        [newCode, user?.id],
      );
      return result.matchedCount === 1;
    } else {
      await this.dataSource.query(
        `SELECT * FROM public."EmailConfirmations"
            ("userId","confirmationCode","expirationDate","isConfirmed")
            VALUES($1,$2,$3,$4)`,
        [user?.id, newCode, add(new Date(), { hours: 1 }), false],
      );
      return true;
    }
  }

  async updateEmailConfirmation(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."EmailConfirmations"
            SET "isConfirmed"=$1
            WHERE "userId"=$2`,
      [true, id],
    );
    return result.matchedCount === 1;
  }
}
