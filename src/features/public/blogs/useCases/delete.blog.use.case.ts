import { Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';

@Injectable()
export class DeleteBlogUseCase {
  constructor(
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
  ) {}
  async execute(id: string): Promise<boolean> {
    return this.blogsRepository.deleteBlogId(id);
  }
}
