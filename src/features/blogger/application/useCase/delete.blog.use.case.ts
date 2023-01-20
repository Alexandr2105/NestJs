import { BlogsRepository } from '../../../public/blogs/blogs.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
  constructor(protected blogsRepository: BlogsRepository) {}
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    return this.blogsRepository.deleteBlogId(command.id);
  }
}
