import { IsEmail, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Length(3, 10, { message: 'Не верно заполнено поле' })
  @Transform(({ value }) => value.trim())
  login: string;
  @IsEmail()
  @Transform(({ value }) => value.trim())
  email: string;
  @Transform(({ value }) => value.trim())
  @Length(6, 20, { message: 'Не верно заполнено поле' })
  password: string;
}
