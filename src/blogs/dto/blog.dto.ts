import { IsUrl, Length } from 'class-validator';

export class CreateBlogDto {
  @Length(1, 15, { message: 'Не верно заполнено поле' })
  name: string;
  @Length(1, 500, { message: 'Не верно заполнено поле' })
  description: string;
  @IsUrl({}, { message: 'Не верно заполнено поле' })
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  websiteUrl: string;
}

export class UpdateBlogDto {
  @Length(1, 15, { message: 'Не верно заполнено поле' })
  name: string;
  @Length(1, 500, { message: 'Не верно заполнено поле' })
  description: string;
  @IsUrl({}, { message: 'Не верно заполнено поле' })
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  websiteUrl: string;
}

export class CreatePostForBlogDto {
  @Length(1, 30, { message: 'Не верно заполнено поле' })
  title: string;
  @Length(1, 100, { message: 'Не верно заполнено поле' })
  shortDescription: string;
  @Length(1, 1000, { message: 'Не верно заполнено поле' })
  content: string;
}
