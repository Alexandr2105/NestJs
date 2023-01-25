import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../../public/blogs/blogs.repository';
import { BlogsSaDto } from '../../dto/blogs.sa.dto';

export class UpdateBlogOwnerCommand {
  constructor(public params: BlogsSaDto) {}
}

@CommandHandler(UpdateBlogOwnerCommand)
export class UpdateBlogOwnerUseCase {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogOwnerCommand) {
    const blog: any = await this.blogsRepository.getBlogId(
      command.params.blogId,
    );
    blog.userId = command.params.userId;
    await this.blogsRepository.save(blog);
  }
}
