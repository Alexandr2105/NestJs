import { UpdateBlogDto } from '../../../public/blogs/dto/blog.dto';
import { BlogsRepository } from '../../../public/blogs/blogs.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class UpdateBlogCommand {
  constructor(public id: string, public body: UpdateBlogDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogDocument(command.id);
    if (!blog) return false;
    blog.name = command.body.name;
    blog.websiteUrl = command.body.websiteUrl;
    blog.description = command.body.description;
    await this.blogsRepository.save(blog);
    return true;
  }
}
