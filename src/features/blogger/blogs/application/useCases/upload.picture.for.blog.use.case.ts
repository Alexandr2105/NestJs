import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FileStorageAdapter } from '../../../../../common/adapters/file.storage.adapter';

export class UploadPictureForBlogCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public wallpaperName: string,
    public wallpaperBuffer: Buffer,
    public folderName: string,
  ) {}
}

@CommandHandler(UploadPictureForBlogCommand)
export class UploadPictureForBlogUseCase {
  constructor(
    private readonly blogRepository: IBlogsRepository,
    private readonly fileStorageAdapter: FileStorageAdapter,
  ) {}

  async execute(command: UploadPictureForBlogCommand) {
    const blog = await this.blogRepository.getBlogId(command.blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.userId) throw new ForbiddenException();
    return this.fileStorageAdapter.saveAvatar(
      command.userId,
      command.wallpaperName,
      command.wallpaperBuffer,
      command.folderName,
    );
  }
}
