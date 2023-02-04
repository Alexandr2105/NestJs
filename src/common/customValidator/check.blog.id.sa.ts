import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepositoryMongo } from '../../features/public/blogs/blogs.repository.mongo';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
export class CheckBlogIdSa implements ValidatorConstraintInterface {
  constructor(protected blogsRepository: BlogsRepositoryMongo) {}

  async validate(blogId: any): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogId(blogId);
    if (!blog || blog.userId) return false;
  }

  defaultMessage(): string {
    return 'Такой блог не существует или у него есть владелец';
  }
}
