import { Length, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckUser } from '../../../../common/customValidator/check.user';

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

export class CheckUserId {
  @Validate(CheckUser)
  commentId: string;
}
