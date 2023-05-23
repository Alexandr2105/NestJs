import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../i.blogs.repository';
import { BlogDocument } from '../../schema/blogs.schema';

export class UnsubscribeToBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(UnsubscribeToBlogCommand)
export class UnsubscribeToBlogUseCase {
  constructor(private readonly blogRepository: IBlogsRepository) {}
  async execute(command: UnsubscribeToBlogCommand) {
    const blog: BlogDocument = await this.blogRepository.getBlogId(
      command.blogId,
    );
    const index = blog.subscribers.indexOf(command.userId);
    if (index !== -1) {
      blog.subscribers.splice(index, 1);
      blog.subscribers.length === 0 ? (blog.isMembership = false) : true;
      await this.blogRepository.save(blog);
    }
  }
}
