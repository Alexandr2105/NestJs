import { IsEmail, Length, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckOriginalLogin } from '../../../../common/customValidator/check.original.login';
import { CheckOriginalEmail } from '../../../../common/customValidator/check.origin.email';

export class CreateUserDto {
  @Length(3, 10, { message: 'Не верно заполнено поле' })
  @Transform(({ value }) => value.trim())
  @Validate(CheckOriginalLogin)
  login: string;
  @IsEmail()
  @Transform(({ value }) => value.trim())
  @Validate(CheckOriginalEmail)
  email: string;
  @Transform(({ value }) => value.trim())
  @Length(6, 20, { message: 'Не верно заполнено поле' })
  password: string;
}
