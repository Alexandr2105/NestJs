import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IBlogsRepository } from '../../features/public/blogs/i.blogs.repository';

@ValidatorConstraint({ name: 'blog', async: true })
@Injectable()
export class CheckIdForBlog implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async validate(id: string): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogId(id);
    if (blog) {
      return true;
    } else {
      throw new NotFoundException();
    }
  }
}
