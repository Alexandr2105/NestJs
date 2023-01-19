import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../../features/public/auth/auth.service';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckRecoveryCode implements ValidatorConstraintInterface {
  constructor(@Inject(AuthService) protected authService: AuthService) {}

  async validate(code: string): Promise<boolean> {
    return !(await this.authService.confirmRecoveryCode(code));
  }

  defaultMessage(): string {
    return 'Не верные данные';
  }
}
