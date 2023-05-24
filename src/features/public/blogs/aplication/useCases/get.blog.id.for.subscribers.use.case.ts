import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../i.blogs.repository';
import { IImageRepository } from '../../../imageRepository/i.image.repository';

export class GetBlogIdForSubscribesCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(GetBlogIdForSubscribesCommand)
export class GetBlogIdForSubscribesUseCase {
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly imageRepository: IImageRepository,
  ) {}
  async execute(
    command: GetBlogIdForSubscribesCommand,
  ) /*: Promise<BlogDocument | false>*/ {
    const blog = await this.blogsRepository.getBlogId(command.id);
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
    let currentUserSubscriptionStatus;
    if (command.userId === null) {
      currentUserSubscriptionStatus = 'None';
    } else if (blog.subscribers.includes(command.userId)) {
      currentUserSubscriptionStatus = 'Subscribed';
    } else {
      currentUserSubscriptionStatus = 'Unsubscribed';
    }
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      images: {
        wallpaper:
          wallpaper[0] === undefined
            ? null
            : {
                url: wallpaper[0]?.url,
                width: wallpaper[0]?.width,
                height: wallpaper[0]?.height,
                fileSize: wallpaper[0]?.fileSize,
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
      currentUserSubscriptionStatus: currentUserSubscriptionStatus,
      subscribersCount: blog.subscribers.length,
    };
  }
}
