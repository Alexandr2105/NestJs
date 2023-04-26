import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../i.blogs.repository';
import { IImageRepository } from '../../../imageRepository/i.image.repository';

export class GetBlogIdSpecialCommand {
  constructor(public id: string) {}
}

@CommandHandler(GetBlogIdSpecialCommand)
export class GetBlogIdSpecialUseCase {
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly imageRepository: IImageRepository,
  ) {}
  async execute(
    command: GetBlogIdSpecialCommand,
  ) /*: Promise<BlogDocument | false>*/ {
    const blog = await this.blogsRepository.getBlogIdSpecial(command.id);
    if (!blog) return false;
    const wallpaper =
      await this.imageRepository.getInfoForImageByBlogIdAndFolderName(
        blog.id,
        'wallpaper',
      );
    const main =
      await this.imageRepository.getInfoForImageByBlogIdAndFolderName(
        blog.id,
        'main',
      );
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      image: {
        wallpaper: {
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
      },
    };
  }
}
