import { Validate } from 'class-validator';
import { CheckLikeStatus } from '../../../../common/customValidators/check.like.status';
import { CheckPostId } from '../../../../common/customValidators/check.post.id';

export class PostsDto {
  @Validate(CheckLikeStatus)
  likeStatus: string;
}

export class CheckParamForPosts {
  @Validate(CheckPostId)
  postId: string;
}
