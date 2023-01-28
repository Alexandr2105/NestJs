import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../../public/blogs/blogs.repository';

export class UpdateBanStatusForBlogSaCommand {
  constructor(public banStatus: boolean, public blogId: string) {}
}

@CommandHandler(UpdateBanStatusForBlogSaCommand)
export class UpdateBanStatusForBlogSaUseCase {
  constructor(protected blogRepository: BlogsRepository) {}

  async execute(command: UpdateBanStatusForBlogSaCommand) {
    const blog: any = await this.blogRepository.getBlogId(command.blogId);
    blog.banStatus = command.banStatus;
    await this.blogRepository.save(blog);
  }
}
