import { User } from './schema/user';
import { EmailResending } from '../../public/auth/dto/auth.dto';
import { BanUsersDocument } from './schema/banUsers';

export abstract class IUsersRepository {
  abstract deleteUser(id: string);
  abstract findLoginOrEmail(logOrEmail: string);
  abstract getUserId(id: string);
  abstract updateEmailConfirmation(id: string);
  abstract getUserByCode(code: string);
  abstract setConfirm(body: EmailResending, newCode: string);
  abstract getUserByIdAll(id: string);
  abstract getBanUsers();
  abstract deleteBanUsers(userId: string);
  abstract save(user: User);
  abstract saveBan(banInfo: BanUsersDocument);
  abstract getUserByEmail(email: string);
  abstract getConfByUserId(userId: string);
  abstract getBanUser(userId: string);
}
