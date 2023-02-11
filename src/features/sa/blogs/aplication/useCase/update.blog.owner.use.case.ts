import { CommandHandler } from '@nestjs/cqrs';
import { BlogsSaDto } from '../../dto/blogs.sa.dto';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';

export class UpdateBlogOwnerCommand {
  constructor(public params: BlogsSaDto) {}
}

@CommandHandler(UpdateBlogOwnerCommand)
export class UpdateBlogOwnerUseCase {
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async execute(command: UpdateBlogOwnerCommand) {
    const blog: any = await this.blogsRepository.getBlogId(
      command.params.blogId,
    );
    blog.userId = command.params.userId;
    await this.blogsRepository.save(blog);
  }
}
