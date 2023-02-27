import { IAuthRepository } from './i.auth.repository';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';
import { Repository } from 'typeorm';
import { EmailConfirmationEntity } from '../../../common/entity/email.confirmation.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthRepositoryTypeorm extends IAuthRepository {
  constructor(
    @InjectRepository(EmailConfirmationEntity)
    private readonly registrationUsersCollection: Repository<EmailConfirmationEntity>,
  ) {
    super();
  }

  async save(emailConf: EmailConfirmationDocument) {
    await this.registrationUsersCollection.save(emailConf);
  }
}
