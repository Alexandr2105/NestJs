import { UpdateBlogDto } from '../dto/blog.dto';
import { Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';

@Injectable()
export class UpdateBlogUseCase {
  constructor(
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
  ) {}

  async execute(id: string, body: UpdateBlogDto): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogDocument(id);
    if (!blog) return false;
    blog.name = body.name;
    blog.websiteUrl = body.websiteUrl;
    blog.description = body.description;
    await this.blogsRepository.save(blog);
    return true;
  }
}
