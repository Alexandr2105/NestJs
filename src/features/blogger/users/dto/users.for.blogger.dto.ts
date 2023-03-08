import { IsBoolean, Length, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckBlogIdForBlog } from '../../../../common/customValidators/check.blog.id.for.blog';
import { CheckUserIdSa } from '../../../../common/customValidators/check.user.id.sa';
import { CheckIdForBlog } from '../../../../common/customValidators/check.id.for.blog';

export class BanUsersForBlogDto {
  @IsBoolean()
  isBanned: boolean;
  @Transform(({ value }) => value.trim())
  @Length(20, 1000)
  banReason: string;
  @Transform(({ value }) => value.trim())
  @Validate(CheckBlogIdForBlog)
  blogId: string;
}

export class UserIdForBlogDto {
  @Validate(CheckUserIdSa)
  id: string;
}

export class CheckIdForBlogBanUser {
  @Validate(CheckIdForBlog)
  id: string;
}
