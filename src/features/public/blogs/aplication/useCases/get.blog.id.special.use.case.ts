import { CommandHandler } from '@nestjs/cqrs';
import { IBlogsRepository } from '../../i.blogs.repository';
import { IImageRepository } from '../../../imageRepository/i.image.repository';
import { ISubscriptionsRepository } from '../../../subscriptionsRepository/i.subscriptions.repository';

export class GetBlogIdSpecialCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(GetBlogIdSpecialCommand)
export class GetBlogIdSpecialUseCase {
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly imageRepository: IImageRepository,
    private readonly subscriptionsRepository: ISubscriptionsRepository,
  ) {}
  async execute(
    command: GetBlogIdSpecialCommand,
  ) /*: Promise<BlogDocument | false>*/ {
    const blog = await this.blogsRepository.getBlogIdSpecial(command.blogId);
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
    let subscription;
    if (command.userId !== null) {
      subscription =
        await this.subscriptionsRepository.getSubscriptionFromBlogIdAndUserId(
          command.blogId,
          command.userId,
        );
    }
    const count =
      await this.subscriptionsRepository.getSubscriptionsCountFromBlogId(
        command.blogId,
      );
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
      currentUserSubscriptionStatus:
        subscription?.status === undefined ? 'None' : subscription.status,
      subscribersCount: count,
    };
  }
}
