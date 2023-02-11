import { Validate } from 'class-validator';
import { CheckLikeStatus } from '../../../../common/customValidators/check.like.status';

export class LikeStatusDto {
  @Validate(CheckLikeStatus)
  likeStatus: string;
}
