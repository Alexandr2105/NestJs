import { IUsersRepository } from './i.users.repository';
import { BanUsersDocument } from './schema/banUsers';
import { EmailResending } from '../../public/auth/dto/auth.dto';
import { User, UserDocument } from './schema/user';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';

export class UsersRepositoryTypeorm extends IUsersRepository {
  deleteBanUsers(userId: string) {}

  deleteUser(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  findLoginOrEmail(logOrEmail: string): Promise<UserDocument> {
    return Promise.resolve(undefined);
  }

  getBanUser(userId: string) {}

  getBanUsers() {}

  getConfByUserId(userId: string) {}

  getUserByCode(code: string): Promise<EmailConfirmationDocument> {
    return Promise.resolve(undefined);
  }

  getUserByEmail(email: string) {}

  getUserByIdAll(id: string) {}

  getUserId(id: string): Promise<UserDocument | false> {
    return Promise.resolve(undefined);
  }

  save(user: User) {}

  saveBan(banInfo: BanUsersDocument) {}

  setConfirm(body: EmailResending, newCode: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  updateEmailConfirmation(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }
}
