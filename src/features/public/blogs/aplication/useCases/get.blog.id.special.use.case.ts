import { BlogDocument } from '../../schema/blogs.schema';
import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../i.blogs.repository';

export class GetBlogIdSpecialCommand {
  constructor(public id: string) {}
}

@CommandHandler(GetBlogIdSpecialCommand)
export class GetBlogIdSpecialUseCase {
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async execute(
    command: GetBlogIdSpecialCommand,
  ): Promise<BlogDocument | false> {
    const blog = await this.blogsRepository.getBlogIdSpecial(command.id);
    if (!blog) return false;
    return blog;
  }
}
