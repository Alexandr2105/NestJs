import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'status', async: true })
@Injectable()
export class CheckLikeStatus implements ValidatorConstraintInterface {
  async validate(likeStatus: string): Promise<boolean> {
    return (
      likeStatus === 'None' || likeStatus === 'Like' || likeStatus === 'Dislike'
    );
  }

  defaultMessage(): string {
    return 'Не верный статус';
  }
}
