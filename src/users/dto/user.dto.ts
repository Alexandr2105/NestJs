import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @Length(3, 10, { message: 'Не верно заполнено поле' })
  // @Matches({})
  login: string;
  @IsEmail()
  email: string;
  @Length(6, 20, { message: 'Не верно заполнено поле' })
  password: string;
}
