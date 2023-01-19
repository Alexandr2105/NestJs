import { BlogDocument } from '../schema/blogs.schema';
import { Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';

@Injectable()
export class GetBlogIdUseCase {
  constructor(
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
  ) {}

  async execute(id: string): Promise<BlogDocument | false> {
    const blog = await this.blogsRepository.getBlogId(id);
    if (!blog) return false;
    return blog;
  }
}
