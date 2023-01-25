import { BlogsRepository } from '../../../public/blogs/blogs.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
  constructor(protected blogsRepository: BlogsRepository) {}
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogId(command.id);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.userId) throw new ForbiddenException();
    return this.blogsRepository.deleteBlogId(command.id);
  }
}
