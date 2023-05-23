import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../i.blogs.repository';
import { BlogDocument } from '../../schema/blogs.schema';

export class SubscribeToBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(SubscribeToBlogCommand)
export class SubscribeToBlogUseCase {
  constructor(private readonly blogRepository: IBlogsRepository) {}
  async execute(command: SubscribeToBlogCommand) {
    const blog: BlogDocument = await this.blogRepository.getBlogId(
      command.blogId,
    );
    if (!blog.subscribers.includes(command.userId)) {
      blog.subscribers.push(command.userId);
      blog.isMembership === false ? (blog.isMembership = true) : false;
      await this.blogRepository.save(blog);
    }
  }
}
