import { BlogsRepository } from '../../../../public/blogs/blogs.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
// import { BlogDocument } from '../../../../public/blogs/schema/blogs.schema';

export class DeleteBlogCommand {
  constructor(public id: string, public userId: string) {}
}
//
// export interface IBlogsRepository {
//   getBlogId(id: string): Promise<BlogDocument>;
//   deleteBlogId(id: string): Promise<boolean>;
// }

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
  constructor(
    protected blogsRepository: BlogsRepository /*: IBlogsRepository*/,
  ) {}
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogId(command.id);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.userId) throw new ForbiddenException();
    return this.blogsRepository.deleteBlogId(command.id);
  }
}
