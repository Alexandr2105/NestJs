import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../../../public/posts/schema/posts.schema';
import { ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostForBlogDto } from '../../dto/blogger.dto';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';
import { IPostsRepository } from '../../../../public/posts/i.posts.repository';
import { BlogDocument } from '../../../../public/blogs/schema/blogs.schema';
import { SendMessageForUserAboutNewPostCommand } from '../../../../integrations/telegram/aplication/useCases/send.message.for.user.about.new.post.use.case';
import { ISubscriptionsRepository } from '../../../../public/subscriptionsRepository/i.subscriptions.repository';
import { IUsersRepository } from '../../../../sa/users/i.users.repository';

export class CreatePostByIdCommand {
  constructor(
    public post: CreatePostForBlogDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostByIdCommand)
export class CreatePostByIdUseCase {
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly postsRepository: IPostsRepository,
    private readonly commandBus: CommandBus,
    private readonly subscriptionsRepository: ISubscriptionsRepository,
    private readonly usersRepository: IUsersRepository,
    @InjectModel('posts') protected postsCollection: Model<PostDocument>,
  ) {}

  async execute(command: CreatePostByIdCommand) {
    const infoBlog: BlogDocument = await this.blogsRepository.getBlogId(
      command.blogId,
    );
    if (infoBlog.userId !== command.userId) throw new ForbiddenException();
    const newPost = new this.postsCollection(command.post);
    newPost.createdAt = new Date().toISOString();
    newPost.id = +new Date() + '';
    newPost.blogName = infoBlog.name;
    newPost.userId = command.userId;
    newPost.blogId = command.blogId;
    await this.postsRepository.save(newPost);
    const subscriptions =
      await this.subscriptionsRepository.getSubscriptionsFromBlogId(
        command.blogId,
      );
    for (const a of subscriptions) {
      const user = await this.usersRepository.getUserByIdAll(a.userId);
      await this.commandBus.execute(
        new SendMessageForUserAboutNewPostCommand(
          user.telegramId,
          infoBlog.name,
        ),
      );
    }
    return {
      id: newPost.id,
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
      images: {
        main: [],
      },
    };
  }
}
