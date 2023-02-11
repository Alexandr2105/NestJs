import {
  Blog,
  BlogDocument,
} from '../../../../public/blogs/schema/blogs.schema';
import { Model } from 'mongoose';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from '../../dto/blogger.dto';
import { IBlogsRepository } from '../../../../public/blogs/i.blogs.repository';

export class CreateBlogCommand {
  constructor(public body: CreateBlogDto, public userId: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    @InjectModel('blogs') private readonly blogsCollection: Model<BlogDocument>,
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
