import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { RegistrationConformation } from '../auth/dto/auth.dto';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckCode implements ValidatorConstraintInterface {
  constructor(@Inject(AuthService) protected authService: AuthService) {}

  async validate(code: RegistrationConformation): Promise<boolean> {
    return !(await this.authService.confirmEmail(code));
  }

  defaultMessage(): string {
    return 'Не верные данные';
  }
}
