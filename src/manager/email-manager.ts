import { EmailAdapter } from '../adapters/email-adapter';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class EmailManager {
  constructor(@Inject(EmailAdapter) protected emailAdapter: EmailAdapter) {}

  async sendEmailAndConfirm(email: string, confirm: string) {
    return await this.emailAdapter.sendEmailRegistration(email, confirm);
  }

  async sendEmailPasswordRecovery(email: string, confirm: string) {
    return await this.emailAdapter.sendEmailPasswordRecovery(email, confirm);
  }
}
