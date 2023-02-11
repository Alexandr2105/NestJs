import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { IBlogsRepository } from '../../features/public/blogs/i.blogs.repository';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckBlogIdSa implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async validate(blogId: any): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogId(blogId);
    if (!blog || blog.userId) return false;
  }

  defaultMessage(): string {
    return 'Такой блог не существует или у него есть владелец';
  }
}
