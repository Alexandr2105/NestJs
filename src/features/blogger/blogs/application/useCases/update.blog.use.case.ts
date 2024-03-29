import { CommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../dto/blogger.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public body: UpdateBlogDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(private readonly blogsRepository: IBlogsRepository) {}
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogId(command.id);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.userId) throw new ForbiddenException();
    blog.name = command.body.name;
    blog.websiteUrl = command.body.websiteUrl;
    blog.description = command.body.description;
    await this.blogsRepository.save(blog);
    return true;
  }
}
