import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';

export class DeleteBlogCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
  constructor(private readonly blogsRepository: IBlogsRepository) {}
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogId(command.id);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.userId) throw new ForbiddenException();
    return this.blogsRepository.deleteBlogId(command.id);
  }
}
