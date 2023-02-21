import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { IBlogsRepository } from '../../features/public/blogs/i.blogs.repository';

@ValidatorConstraint({ name: 'blog', async: true })
@Injectable()
export class CheckBlogIdForBlog implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async validate(id: string): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogId(id);
    return !!blog;
  }

  defaultMessage(): string {
    return 'Такой блог не существует';
  }
}
