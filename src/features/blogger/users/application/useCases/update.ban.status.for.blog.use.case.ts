import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryMongo } from '../../../../public/blogs/blogs.repository.mongo';
import { BanUsersForBlogDto } from '../../dto/users.for.blogger.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BanUsersForBlogDocument } from '../../../../public/blogs/schema/ban.users.for.blog.schema';

export class UpdateBanStatusForBlogCommand {
  constructor(
    public body: BanUsersForBlogDto,
    public userId: string,
    public ownerBlogId: string,
  ) {}
}

@CommandHandler(UpdateBanStatusForBlogCommand)
export class UpdateBanStatusForBlogUseCase {
  constructor(
    @InjectModel('banUsersForBlogs')
    protected banUsersForBlogsCollection: Model<BanUsersForBlogDocument>,
    protected blogsRepository: BlogsRepositoryMongo,
  ) {}

  async execute(command: UpdateBanStatusForBlogCommand) {
    const blog = await this.blogsRepository.getBlogId(command.body.blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.ownerBlogId) throw new ForbiddenException();
    const banUsers = await this.blogsRepository.getBanUsersForBlogs(blog.id);
    const banUser = banUsers.find((a) => a.userId === command.userId);
    if (!banUser && command.body.isBanned === false) return;
    if (banUser && command.body.isBanned === true) {
      banUser.isBanned = command.body.isBanned;
      banUser.banDate = new Date().toISOString();
      banUser.banReason = command.body.banReason;
      await this.blogsRepository.saveBanUser(banUser);
    } else if (banUser && command.body.isBanned === false) {
      await this.blogsRepository.deleteBanUsers(banUser.userId);
    } else {
      const banUser = new this.banUsersForBlogsCollection();
      banUser.blogId = command.body.blogId;
      banUser.userId = command.userId;
      banUser.isBanned = command.body.isBanned;
      banUser.banDate = new Date().toISOString();
      banUser.banReason = command.body.banReason;
      await this.blogsRepository.saveBanUser(banUser);
    }
  }
}
