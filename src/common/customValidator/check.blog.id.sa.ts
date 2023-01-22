import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../features/public/blogs/blogs.repository';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckBlogIdSa implements ValidatorConstraintInterface {
  constructor(protected blogsRepository: BlogsRepository) {}

  async validate(blogId: any): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogId(blogId);
    if (!blog || blog.userId) return false;
  }
}
