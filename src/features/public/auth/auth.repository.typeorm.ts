import { IAuthRepository } from './i.auth.repository';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';

export class AuthRepositoryTypeorm extends IAuthRepository {
  save(emailConf: EmailConfirmationDocument) {}
}
