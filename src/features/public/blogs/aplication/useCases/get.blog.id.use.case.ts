import { BlogDocument } from '../../schema/blogs.schema';
import { BlogsRepositoryMongo } from '../../blogs.repository.mongo';
import { CommandHandler } from '@nestjs/cqrs';

export class GetBlogIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(GetBlogIdCommand)
export class GetBlogIdUseCase {
  constructor(protected blogsRepository: BlogsRepositoryMongo) {}

  async execute(command: GetBlogIdCommand): Promise<BlogDocument | false> {
    const blog = await this.blogsRepository.getBlogIdSpecial(command.id);
    if (!blog) return false;
    return blog;
  }
}
