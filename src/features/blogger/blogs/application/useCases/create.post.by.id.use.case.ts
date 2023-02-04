import { CommandHandler } from '@nestjs/cqrs';
import {
  Post,
  PostDocument,
} from '../../../../public/posts/schema/posts.schema';
import { ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsRepositoryMongo } from '../../../../public/blogs/blogs.repository.mongo';
import { PostsRepository } from '../../../../public/posts/posts.repository';
import { CreatePostForBlogDto } from '../../dto/blogger.dto';

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
    protected blogsRepository: BlogsRepositoryMongo,
    protected postsRepository: PostsRepository,
    @InjectModel('posts') protected postsCollection: Model<PostDocument>,
  ) {}

  async execute(command: CreatePostByIdCommand): Promise<Post | false> {
    const infoBlog: any = await this.blogsRepository.getBlogId(command.blogId);
    if (infoBlog.userId !== command.userId) throw new ForbiddenException();
    const newPost = new this.postsCollection(command.post);
    newPost.createdAt = new Date().toISOString();
    newPost.id = +new Date() + '';
    newPost.blogName = infoBlog.name;
    newPost.userId = command.userId;
    newPost.blogId = command.blogId;
    await this.postsRepository.save(newPost);
    return newPost;
  }
}
