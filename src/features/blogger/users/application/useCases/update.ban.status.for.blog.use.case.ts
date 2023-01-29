import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../../public/blogs/blogs.repository';
import { BanUsersForBlogDto } from '../../dto/users.for.blogger.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateBanStatusForBlogCommand {
  constructor(
    public body: BanUsersForBlogDto,
    public userId: string,
    public ownerBlogId: string,
  ) {}
}

@CommandHandler(UpdateBanStatusForBlogCommand)
export class UpdateBanStatusForBlogUseCase {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBanStatusForBlogCommand) {
    const blog = await this.blogsRepository.getBlogId(command.body.blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.ownerBlogId) throw new ForbiddenException();
    const banUser = blog.banUsers.find((a) => a.userId === command.userId);
    if (!banUser && command.body.isBanned === false) return;
    if (banUser) {
      banUser.isBanned = command.body.isBanned;
      banUser.banDate = new Date().toISOString();
      banUser.banReason = command.body.banReason;
      await this.blogsRepository.save(blog);
    }
    if (banUser && command.body.isBanned === false) {
      const index = blog.banUsers.findIndex((a) => a.userId === command.userId);
      blog.banUsers.splice(index, 1);
      await this.blogsRepository.save(blog);
    } else {
      blog.banUsers.push({
        userId: command.userId,
        isBanned: command.body.isBanned,
        banDate: new Date().toISOString(),
        banReason: command.body.banReason,
      });
      await this.blogsRepository.save(blog);
    }
  }
}
