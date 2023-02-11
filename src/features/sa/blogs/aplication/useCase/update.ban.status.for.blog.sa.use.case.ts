import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';

export class UpdateBanStatusForBlogSaCommand {
  constructor(public banStatus: boolean, public blogId: string) {}
}

@CommandHandler(UpdateBanStatusForBlogSaCommand)
export class UpdateBanStatusForBlogSaUseCase {
  constructor(private readonly blogRepository: IBlogsRepository) {}

  async execute(command: UpdateBanStatusForBlogSaCommand) {
    const blog: any = await this.blogRepository.getBlogId(command.blogId);
    if (command.banStatus === false) {
      blog.banStatus = command.banStatus;
      blog.banDate = null;
      await this.blogRepository.save(blog);
    } else {
      blog.banStatus = command.banStatus;
      blog.banDate = new Date().toISOString();
      await this.blogRepository.save(blog);
    }
  }
}
