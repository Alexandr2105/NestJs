import { IsEmail, Length } from 'class-validator';

export class LoginDto {
  loginOrEmail: string;
  password: string;
}

export class RegistrationConformation {
  code: string;
}

export class EmailResending {
  @IsEmail()
  email: string;
}

export class NewPassword {
  @Length(6, 20, { message: 'Не верно заполнено поле' })
  newPassword: string;
  recoveryCode: string;
}
