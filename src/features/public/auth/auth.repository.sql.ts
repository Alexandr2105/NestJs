import { Injectable } from '@nestjs/common';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IAuthRepository } from './application/useCase/create.email.confirmation.use.cae';

@Injectable()
export class AuthRepositorySql implements IAuthRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async save(emailConfirmationDocument: EmailConfirmationDocument) {
    return this.dataSource.query(
      `INSERT INTO public."EmailConfirmations"
("userId", "confirmationCode", "expirationDate", "isConfirmed")
VALUES ($1, $2, $3, $4)`,
      [
        emailConfirmationDocument.userId,
        emailConfirmationDocument.confirmationCode,
        emailConfirmationDocument.expirationDate,
        emailConfirmationDocument.isConfirmed,
      ],
    );
  }
}
