import { IsEmail, Length, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckEmailConfirmation } from '../../../../common/customValidator/check.email.confirmation';
import { CheckCode } from '../../../../common/customValidator/check.code';
import { CheckRecoveryCode } from '../../../../common/customValidator/check.recovery.code';

export class LoginDto {
  @Transform(({ value }) => value.trim())
  loginOrEmail: string;
  @Transform(({ value }) => value.trim())
  password: string;
}

export class RegistrationConformation {
  @Transform(({ value }) => value.trim())
  @Validate(CheckCode)
  code: string;
}

export class EmailResending {
  @Transform(({ value }) => value.trim())
  @IsEmail()
  @Validate(CheckEmailConfirmation)
  email: string;
}

export class NewPassword {
  @Transform(({ value }) => value.trim())
  @Length(6, 20, { message: 'Не верно заполнено поле' })
  newPassword: string;
  @Transform(({ value }) => value.trim())
  @Validate(CheckRecoveryCode)
  recoveryCode: string;
}
