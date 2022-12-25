import { Length } from 'class-validator';

export class CreatePostDto {
  @Length(1, 30, { message: 'Не верно заполнено поле' })
  title: string;
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  shortDescription: string;
  @Length(1, 1000, { message: 'Не верно заполнено поле' })
  content: string;
  blogId: string;
}

export class UpdatePostDto {
  @Length(1, 30, { message: 'Не верно заполнено поле' })
  title: string;
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  shortDescription: string;
  @Length(1, 1000, { message: 'Не верно заполнено поле' })
  content: string;
  blogId: string;
}
