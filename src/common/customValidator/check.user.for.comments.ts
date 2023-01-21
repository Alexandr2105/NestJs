import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentDocument } from '../../features/public/comments/schema/comment.schema';

@ValidatorConstraint({ name: 'comment', async: true })
@Injectable()
export class CheckUserForComments implements ValidatorConstraintInterface {
  constructor(
    @InjectModel('comments')
    protected commentCollection: Model<CommentDocument>,
  ) {}

  async validate(id: string): Promise<boolean> {
    const comment = await this.commentCollection.findOne({ id: id });
    if (!comment) throw new NotFoundException();
    return true;
  }
}
