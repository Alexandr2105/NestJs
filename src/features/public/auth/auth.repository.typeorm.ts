import { IAuthRepository } from './i.auth.repository';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';
import { Repository } from 'typeorm';
import { EmailConfirmationEntity } from '../../../common/entity/email.confirmation.entity';

export class AuthRepositoryTypeorm extends IAuthRepository {
  constructor(
    private readonly registrationUsersCollection: Repository<EmailConfirmationEntity>,
  ) {
    super();
  }

  async save(emailConf: EmailConfirmationDocument) {
    await this.registrationUsersCollection.save(emailConf);
  }
}
