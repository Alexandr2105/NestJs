import { Validate } from 'class-validator';
import { CheckBlogIdSa } from '../../../../common/customValidator/check.blog.id.sa';
import { CheckUserIdSa } from '../../../../common/customValidator/check.user.id.sa';

export class BlogsSaDto {
  @Validate(CheckBlogIdSa)
  blogId: string;
  @Validate(CheckUserIdSa)
  userId: string;
}
