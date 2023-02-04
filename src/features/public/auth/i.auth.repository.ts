import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';

export abstract class IAuthRepository {
  abstract save(emailConf: EmailConfirmationDocument);
}
