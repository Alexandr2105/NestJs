import { Length } from 'class-validator';

export class UpdateCommentDto {
  @Length(20, 300, { message: 'Не верно заполнено поле' })
  content: string;
}

export class CreateCommentDto {
  @Length(20, 300, { message: 'Не верно заполнено поле' })
  content: string;
}
