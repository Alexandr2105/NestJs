import { Length, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckIdComment } from '../../customValidator/check.id.comment';

export class UpdateCommentDto {
  @Transform(({ value }) => value.trim())
  @Length(20, 300, { message: 'Не верно заполнено поле' })
  content: string;
}

export class CreateCommentDto {
  @Transform(({ value }) => value.trim())
  @Length(20, 300, { message: 'Не верно заполнено поле' })
  content: string;
}

export class CommentIdDto {
  @Validate(CheckIdComment)
  commentId: string;
}
