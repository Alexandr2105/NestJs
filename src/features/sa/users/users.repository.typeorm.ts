import { IUsersRepository } from './i.users.repository';
import { BanUsersDocument } from './schema/banUsers';
import { EmailResending } from '../../public/auth/dto/auth.dto';
import { User, UserDocument } from './schema/user';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';

export class UsersRepositoryTypeorm extends IUsersRepository {
  async deleteBanUsers(userId: string) {}

  async deleteUser(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  async findLoginOrEmail(logOrEmail: string): Promise<UserDocument> {
    return Promise.resolve(undefined);
  }

  async getBanUser(userId: string) {}

  async getBanUsers() {}

  async getConfByUserId(userId: string) {}

  async getUserByCode(code: string): Promise<EmailConfirmationDocument> {
    return Promise.resolve(undefined);
  }

  async getUserByEmail(email: string) {}

  async getUserByIdAll(id: string) {}

  async getUserId(id: string): Promise<UserDocument | false> {
    return Promise.resolve(undefined);
  }

  async save(user: User) {}

  async saveBan(banInfo: BanUsersDocument) {}

  async setConfirm(body: EmailResending, newCode: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  async updateEmailConfirmation(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }
}
