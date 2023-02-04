import {
  Blog,
  BlogDocument,
} from '../../../../public/blogs/schema/blogs.schema';
import { BlogsRepositoryMongo } from '../../../../public/blogs/blogs.repository.mongo';
import { Model } from 'mongoose';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from '../../dto/blogger.dto';

export class CreateBlogCommand {
  constructor(public body: CreateBlogDto, public userId: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(
    protected blogsRepository: BlogsRepositoryMongo,
    @InjectModel('blogs') protected blogsCollection: Model<BlogDocument>,
  ) {}

  async execute(command: CreateBlogCommand): Promise<Blog> {
    const newBlog = new this.blogsCollection(command.body);
    newBlog.id = +new Date() + '';
    newBlog.createdAt = new Date().toISOString();
    newBlog.userId = command.userId;
    newBlog.banStatus = false;
    newBlog.isMembership = false;
    await this.blogsRepository.save(newBlog);
    return newBlog;
  }
}
