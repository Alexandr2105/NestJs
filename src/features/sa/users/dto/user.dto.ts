import { IsBoolean, IsEmail, Length, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckOriginalLogin } from '../../../../common/customValidators/check.original.login';
import { CheckOriginalEmail } from '../../../../common/customValidators/check.origin.email';

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

export class BanUserDto {
  @IsBoolean()
  isBanned: boolean;
  @Transform(({ value }) => value.trim())
  @Length(20, 1000, { message: 'Не верная длинна строки' })
  banReason: string;
}
