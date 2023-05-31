import { Injectable } from '@nestjs/common';
import { settings } from '../../settings';
import fetch from 'node-fetch';

@Injectable()
export class RecaptchaAdapter {
  async isValid(value) {
    const result = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body: `secret=${settings.RECAPTCHA_ADAPTER_SECRET}&response=${value}`,
      },
    );
    const response: RecaptchaResponse = await result.json();
    return response.success;
  }
}

type RecaptchaResponse = {
  success: true | false;
  challenge_ts: string;
  hostname: string;
  'error-codes': any[];
};
