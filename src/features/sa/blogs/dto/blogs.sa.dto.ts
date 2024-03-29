import { IsBoolean, Validate } from 'class-validator';
import { CheckBlogIdSa } from '../../../../common/customValidators/check.blog.id.sa';
import { CheckUserIdSa } from '../../../../common/customValidators/check.user.id.sa';
import { CheckBlogIdForBlog } from '../../../../common/customValidators/check.blog.id.for.blog';

export class BlogsSaDto {
  @Validate(CheckBlogIdSa)
  blogId: string;
  @Validate(CheckUserIdSa)
  userId: string;
}

export class BanStatusForBlogDto {
  @IsBoolean()
  isBanned: boolean;
}

export class CheckBlogIdDto {
  @Validate(CheckBlogIdForBlog)
  id: string;
}
