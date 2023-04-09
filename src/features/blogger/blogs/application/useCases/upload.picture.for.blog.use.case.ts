import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FileStorageAdapterS3 } from '../../../../../common/adapters/file.storage.adapter.s3';
import { ImageModelDocument } from '../../../../../common/schemas/image.schema';

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
    private readonly fileStorageAdapter: FileStorageAdapterS3,
  ) {}

  async execute(command: UploadPictureForBlogCommand) {
    const blog = await this.blogRepository.getBlogId(command.blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.userId) throw new ForbiddenException();
    const image: ImageModelDocument =
      await this.fileStorageAdapter.saveImageForBlog(
        command.userId,
        command.wallpaperName,
        command.wallpaperBuffer,
        command.folderName,
        command.blogId,
      );
    const imageInfo = await this.blogRepository.getInfoForImage(image.url);
    if (!imageInfo) {
      await this.blogRepository.saveImage(image);
    } else {
      imageInfo.id = image.id;
      await this.blogRepository.saveImage(imageInfo);
    }
  }
}
