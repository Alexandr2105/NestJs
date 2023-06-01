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
    if (post.blogId !== command.blogId) throw new NotFoundException();
    if (post.userId !== command.userId) throw new ForbiddenException();
    const image: ImageModelDocument =
      await this.fileStorageAdapter.saveImageForPost(
        command.userId,
        command.wallpaperName,
        command.wallpaperBuffer,
        command.folderName,
        command.blogId,
        command.postId,
        'original',
      );
    const imageMiddleInfo = await sharp(command.wallpaperBuffer)
      .resize(300, 180, {
        fit: 'contain',
      })
      .toBuffer();
    const imageSmallInfo = await sharp(command.wallpaperBuffer)
      .resize(149, 96, {
        fit: 'contain',
      })
      .toBuffer();
    const imageMiddle: ImageModelDocument =
      await this.fileStorageAdapter.saveImageForPost(
        command.userId,
        command.wallpaperName,
        imageMiddleInfo,
        command.folderName,
        command.blogId,
        command.postId,
        'middle',
      );
    const imageSmall: ImageModelDocument =
      await this.fileStorageAdapter.saveImageForPost(
        command.userId,
        command.wallpaperName,
        imageSmallInfo,
        command.folderName,
        command.blogId,
        command.postId,
        'small',
      );
    const infoImage = await sharp(command.wallpaperBuffer).metadata();
    const infoMiddleImage = await sharp(imageMiddleInfo).metadata();
    const infoSmallImage = await sharp(imageSmallInfo).metadata();
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
    imageMiddle.url = `https://storage.yandexcloud.net/${imageMiddle.bucket}/${imageMiddle.key}`;
    imageMiddle.width = infoMiddleImage.width;
    imageMiddle.height = infoMiddleImage.height;
    imageMiddle.fileSize = infoMiddleImage.size;
    imageMiddle.folderName = command.folderName;
    const infoImageMiddle = await this.imageRepository.getInfoForImageByUrl(
      imageMiddle.url,
    );
    if (!infoImageMiddle) {
      await this.imageRepository.saveImage(imageMiddle);
    } else {
      infoImageMiddle.id = imageMiddle.id;
      await this.imageRepository.saveImage(infoImageMiddle);
    }
    imageSmall.url = `https://storage.yandexcloud.net/${imageSmall.bucket}/${imageSmall.key}`;
    imageSmall.width = infoSmallImage.width;
    imageSmall.height = infoSmallImage.height;
    imageSmall.fileSize = infoSmallImage.size;
    imageSmall.folderName = command.folderName;
    const infoImageSmall = await this.imageRepository.getInfoForImageByUrl(
      imageSmall.url,
    );
    if (!infoImageSmall) {
      await this.imageRepository.saveImage(imageSmall);
    } else {
      infoImageSmall.id = imageSmall.id;
      await this.imageRepository.saveImage(infoImageSmall);
    }
    const main =
      await this.imageRepository.getInfoForImageByPostIdAndFolderName(
        command.postId,
        'main',
      );
    return {
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
