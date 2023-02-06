import { User, UserDocument } from './schema/user';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';
import { EmailResending } from '../../public/auth/dto/auth.dto';
import { BanUsersDocument } from './schema/banUsers';

export abstract class IUsersRepository {
  abstract deleteUser(id: string): Promise<boolean>;
  abstract findLoginOrEmail(logOrEmail: string): Promise<UserDocument>;
  abstract getUserId(id: string): Promise<UserDocument | false>;
  abstract updateEmailConfirmation(id: string): Promise<boolean>;
  abstract getUserByCode(code: string): Promise<EmailConfirmationDocument>;
  abstract setConfirm(body: EmailResending, newCode: string): Promise<boolean>;
  abstract getUserByIdAll(id: string);
  abstract getBunUsers();
  abstract deleteBanUsers(userId: string);
  abstract save(user: User);
  abstract saveBan(banInfo: BanUsersDocument);
  abstract getUserByEmail(email: string);
  abstract getConfByUserId(userId: string);
}
