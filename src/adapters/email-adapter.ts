import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { EmailResending } from '../auth/dto/auth.dto';

@Injectable()
export class EmailAdapter {
  async sendEmailRegistration(body: EmailResending, confirm: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'testnodemaileremail@gmail.com',
        pass: 'nfzdgxtapolqzxvo',
      },
    });

    await transporter.sendMail({
      from: 'Alex <testnodemaileremail@gmail.com>',
      to: body.email,
      subject: 'Registration',
      html: `<h1>Thank for your registration</h1>
                       <p>To finish registration please follow the link below:
                          <a href='https://somesite.com/confirm-email?code=${confirm}'>complete registration</a>
                        </p>`,
    });
    return true;
  }

  async sendEmailPasswordRecovery(body: EmailResending, confirm: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'testnodemaileremail@gmail.com',
        pass: 'nfzdgxtapolqzxvo',
      },
    });

    await transporter.sendMail({
      from: 'Alex <testnodemaileremail@gmail.com>',
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
