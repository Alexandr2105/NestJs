import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckCode implements ValidatorConstraintInterface {
  constructor(@Inject(AuthService) protected authService: AuthService) {}

  async validate(code: string): Promise<boolean> {
    return await this.authService.confirmEmail(code);
  }

  defaultMessage(): string {
    return 'Не верные данные';
  }
}
