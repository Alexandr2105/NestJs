import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICommentsRepository } from '../../features/public/comments/i.comments.repository';

@ValidatorConstraint({ name: 'comment', async: true })
@Injectable()
export class CheckUserForComments implements ValidatorConstraintInterface {
  constructor(private readonly commentRepository: ICommentsRepository) {}

  async validate(id: string): Promise<boolean> {
    const comment = await this.commentRepository.getCommentById(id);
    if (!comment) throw new NotFoundException();
    return true;
  }
}
