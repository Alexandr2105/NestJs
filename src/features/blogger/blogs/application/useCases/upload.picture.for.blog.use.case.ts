import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FileStorageAdapterS3 } from '../../../../../common/adapters/file.storage.adapter.s3';
import { ImageModelDocument } from '../../../../../common/schemas/image.schema';
import sharp from 'sharp';
import { IImageRepository } from '../../../../public/imageRepository/i.image.repository';

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
    private readonly imageRepository: IImageRepository,
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
    const infoImage = await sharp(command.wallpaperBuffer).metadata();
    image.url = `https://storage.yandexcloud.net/${image.bucket}/${image.key}`;
    image.height = infoImage.height;
    image.width = infoImage.width;
    image.folderName = command.folderName;
    image.fileSize = infoImage.size;
    const imageInfo = await this.imageRepository.getInfoForImageByUrl(
      image.url,
    );
    if (!imageInfo) {
      await this.imageRepository.saveImage(image);
    } else {
      imageInfo.id = image.id;
      await this.imageRepository.saveImage(imageInfo);
    }
    const wallpaper =
      await this.imageRepository.getInfoForImageByBlogIdAndFolderName(
        command.blogId,
        'wallpaper',
      );
    const main =
      await this.imageRepository.getInfoForImageByBlogIdAndFolderName(
        command.blogId,
        'main',
      );
    return {
      wallpaper:
        wallpaper[0] === undefined
          ? null
          : {
              url: wallpaper[0].url,
              width: wallpaper[0].width,
              height: wallpaper[0].height,
              fileSize: wallpaper[0].fileSize,
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
