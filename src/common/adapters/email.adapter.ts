import { Injectable } from '@nestjs/common';
import { EmailResending } from '../../features/public/auth/dto/auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailAdapter {
  constructor(private readonly mailService: MailerService) {}

  async sendEmailRegistration(body: EmailResending, confirm: string) {
    await this.mailService.sendMail({
      from: 'Alex <testnodemaileremail2@gmail.com>',
      to: body.email,
      subject: 'Registration',
      html: `<h1>Thank for your registration</h1>
                       <p>To finish registration please follow the link below:
                          <a href='https://somesite.com/registration-confirmation?code=${confirm}'>complete registration</a>
                        </p>`,
    });
    return true;
  }

  async sendEmailPasswordRecovery(body: EmailResending, confirm: string) {
    await this.mailService.sendMail({
      from: 'Alex <testnodemaileremail2@gmail.com>',
      to: body.email,
      subject: 'Password Recovery',
      html: `<h1>Password recovery</h1>
                <p>To finish password recovery please follow the link below:
                <a href='https://somesite.com/password-recovery?recoveryCode=${confirm}'>recovery password</a>
                </p>`,
    });
    return true;
  }
}
