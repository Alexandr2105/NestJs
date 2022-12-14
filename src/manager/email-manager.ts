import { EmailAdapter } from '../adapters/email-adapter';
import { Inject, Injectable } from '@nestjs/common';
import { EmailResending } from '../auth/dto/auth.dto';

@Injectable()
export class EmailManager {
  constructor(@Inject(EmailAdapter) protected emailAdapter: EmailAdapter) {}

  async sendEmailAndConfirm(body: EmailResending, confirm: string) {
    return await this.emailAdapter.sendEmailRegistration(body, confirm);
  }

  async sendEmailPasswordRecovery(body: EmailResending, confirm: string) {
    return await this.emailAdapter.sendEmailPasswordRecovery(body, confirm);
  }
}
