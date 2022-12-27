import { IsEmail, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @Transform(({ value }) => value.trim())
  loginOrEmail: string;
  @Transform(({ value }) => value.trim())
  password: string;
}

export class RegistrationConformation {
  @Transform(({ value }) => value.trim())
  code: string;
}

export class EmailResending {
  @Transform(({ value }) => value.trim())
  @IsEmail()
  email: string;
}

export class NewPassword {
  @Transform(({ value }) => value.trim())
  @Length(6, 20, { message: 'Не верно заполнено поле' })
  newPassword: string;
  @Transform(({ value }) => value.trim())
  recoveryCode: string;
}
