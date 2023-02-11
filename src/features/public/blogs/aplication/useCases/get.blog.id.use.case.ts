import { BlogDocument } from '../../schema/blogs.schema';
import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../i.blogs.repository';

export class GetBlogIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(GetBlogIdCommand)
export class GetBlogIdUseCase {
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async execute(command: GetBlogIdCommand): Promise<BlogDocument | false> {
    const blog = await this.blogsRepository.getBlogId(command.id);
    if (!blog) return false;
    return blog;
  }
}
