import { Length, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckBlogIdForPost } from '../../customValidator/check.blog.id.for.post';

export class CreatePostDto {
  @Transform(({ value }) => value.trim())
  @Length(1, 30, { message: 'Не верно заполнено поле' })
  title: string;
  @Transform(({ value }) => value.trim())
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  shortDescription: string;
  @Transform(({ value }) => value.trim())
  @Length(1, 1000, { message: 'Не верно заполнено поле' })
  content: string;
  @Transform(({ value }) => value.trim())
  @Validate(CheckBlogIdForPost)
  blogId: string;
}

export class UpdatePostDto {
  @Transform(({ value }) => value.trim())
  @Length(1, 30, { message: 'Не верно заполнено поле' })
  title: string;
  @Transform(({ value }) => value.trim())
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  shortDescription: string;
  @Transform(({ value }) => value.trim())
  @Length(1, 1000, { message: 'Не верно заполнено поле' })
  content: string;
  @Transform(({ value }) => value.trim())
  blogId: string;
}
