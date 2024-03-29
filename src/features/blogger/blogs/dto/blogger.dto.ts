import { Transform } from 'class-transformer';
import { IsUrl, Length, Validate } from 'class-validator';
import { CheckIdForBlog } from '../../../../common/customValidators/check.id.for.blog';
import { CheckPostId } from '../../../../common/customValidators/check.post.id';

export class CreateBlogDto {
  @Transform(({ value }) => value.trim())
  @Length(1, 15)
  name: string;
  @Transform(({ value }) => value.trim())
  @Length(1, 500)
  description: string;
  @Transform(({ value }) => value.trim())
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}

export class UpdateBlogDto {
  @Transform(({ value }) => value.trim())
  @Length(1, 15, { message: 'Не верно заполнено поле' })
  name: string;
  @Transform(({ value }) => value.trim())
  @Length(1, 500, { message: 'Не верно заполнено поле' })
  description: string;
  @Transform(({ value }) => value.trim())
  @IsUrl({}, { message: 'Не верно заполнено поле' })
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  websiteUrl: string;
}

export class CreatePostForBlogDto {
  @Transform(({ value }) => value.trim())
  @Length(1, 30, { message: 'Не верно заполнено поле' })
  title: string;
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  @Transform(({ value }) => value.trim())
  shortDescription: string;
  @Transform(({ value }) => value.trim())
  @Length(1, 1000, { message: 'Не верно заполнено поле' })
  content: string;
}

export class UpdatePostByIdDto {
  @Transform(({ value }) => value.trim())
  @Length(1, 30, { message: 'Не верно заполнено поле' })
  title: string;
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  @Transform(({ value }) => value.trim())
  shortDescription: string;
  @Transform(({ value }) => value.trim())
  @Length(1, 1000, { message: 'Не верно заполнено поле' })
  content: string;
}

export class CheckBlogId {
  @Validate(CheckIdForBlog)
  blogId: string;
}

export class CheckPostIdDto {
  @Validate(CheckPostId)
  postId: string;
}
