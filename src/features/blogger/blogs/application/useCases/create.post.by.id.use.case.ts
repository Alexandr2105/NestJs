import { CommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../../../public/posts/schema/posts.schema';
import { ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostForBlogDto } from '../../dto/blogger.dto';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';
import { IPostsRepository } from '../../../../public/posts/i.posts.repository';

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
    @InjectModel('posts') protected postsCollection: Model<PostDocument>,
  ) {}

  async execute(command: CreatePostByIdCommand) {
    const infoBlog: any = await this.blogsRepository.getBlogId(command.blogId);
    if (infoBlog.userId !== command.userId) throw new ForbiddenException();
    const newPost = new this.postsCollection(command.post);
    newPost.createdAt = new Date().toISOString();
    newPost.id = +new Date() + '';
    newPost.blogName = infoBlog.name;
    newPost.userId = command.userId;
    newPost.blogId = command.blogId;
    await this.postsRepository.save(newPost);
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
