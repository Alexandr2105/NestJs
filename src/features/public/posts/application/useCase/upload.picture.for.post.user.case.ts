import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IPostsRepository } from '../../i.posts.repository';
import { ImageModelDocument } from '../../../../../common/schemas/image.schema';
import { FileStorageAdapterS3 } from '../../../../../common/adapters/file.storage.adapter.s3';
import sharp from 'sharp';
import { IImageRepository } from '../../../imageRepository/i.image.repository';

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
    private readonly imageRepository: IImageRepository,
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
    const infoImage = await sharp(command.wallpaperBuffer).metadata();
    image.url = `https://storage.yandexcloud.net/${image.bucket}/${image.key}`;
    image.width = infoImage.width;
    image.height = infoImage.height;
    image.fileSize = infoImage.size;
    image.folderName = command.folderName;
    const imageInfo = await this.imageRepository.getInfoForImageByUrl(
      image.url,
    );
    if (!imageInfo) {
      await this.imageRepository.saveImage(image);
    } else {
      imageInfo.id = image.id;
      await this.imageRepository.saveImage(imageInfo);
    }
    const main =
      await this.imageRepository.getInfoForImageByBlogIdAndFolderName(
        command.blogId,
        'main',
      );
    const wallpaper =
      await this.imageRepository.getInfoForImageByBlogIdAndFolderName(
        command.blogId,
        'wallpaper',
      );
    return {
      wallpaper:
        wallpaper === undefined
          ? null
          : {
              url: wallpaper.url,
              width: wallpaper.width,
              height: wallpaper.height,
              fileSize: wallpaper.fileSize,
            },
      main: main.map((a) => {
        return {
          url: a.url,
          width: a.width,
          height: a.height,
          fileSize: a.fileSize,
        };
      }),
    };
  }
}
