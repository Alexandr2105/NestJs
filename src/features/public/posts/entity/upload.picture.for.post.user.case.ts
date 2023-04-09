import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IPostsRepository } from '../i.posts.repository';
import { ImageModelDocument } from '../../../../common/schemas/image.schema';
import { FileStorageAdapterS3 } from '../../../../common/adapters/file.storage.adapter.s3';

export class UploadPictureForPostCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public postId: string,
    public wallpaperName: string,
    public wallpaperBuffer: Buffer,
    public folderName: string,
  ) {}
}

@CommandHandler(UploadPictureForPostCommand)
export class UploadPictureForPostUserCase {
  constructor(
    private readonly postRepository: IPostsRepository,
    private readonly fileStorageAdapter: FileStorageAdapterS3,
  ) {}

  async execute(command: UploadPictureForPostCommand) {
    const post = await this.postRepository.getPostId(command.postId);
    if (!post) throw new NotFoundException();
    if (post.userId !== command.userId || post.blogId !== command.blogId)
      throw new ForbiddenException();
    const image: ImageModelDocument =
      await this.fileStorageAdapter.saveImageForPost(
        command.userId,
        command.wallpaperName,
        command.wallpaperBuffer,
        command.folderName,
        command.blogId,
        command.postId,
      );
    const imageInfo = await this.postRepository.getInfoForImage(image.url);
    if (!imageInfo) {
      await this.postRepository.saveImage(image);
    } else {
      imageInfo.id = image.id;
      await this.postRepository.saveImage(imageInfo);
    }
  }
}
