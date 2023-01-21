import { Validate } from 'class-validator';
import { CheckLikeStatus } from '../../../../common/customValidator/check.like.status';

export class LikeStatusDto {
  @Validate(CheckLikeStatus)
  likeStatus: string;
}
