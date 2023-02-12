import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IPostsRepository } from '../../features/public/posts/i.posts.repository';

@ValidatorConstraint({ name: 'status', async: true })
@Injectable()
export class CheckPostId implements ValidatorConstraintInterface {
  constructor(private readonly postsRepository: IPostsRepository) {}

  async validate(postId: string): Promise<boolean> {
    const post = this.postsRepository.getPostId(postId);
    if (post) {
      return true;
    } else {
      throw new NotFoundException();
    }
  }
}
