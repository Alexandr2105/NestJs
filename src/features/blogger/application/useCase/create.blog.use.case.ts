import { CreateBlogDto } from '../../../public/blogs/dto/blog.dto';
import { Blog, BlogDocument } from '../../../public/blogs/schema/blogs.schema';
import { BlogsRepository } from '../../../public/blogs/blogs.repository';
import { Model } from 'mongoose';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

export class CreateBlogCommand {
  constructor(public body: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel('blogs') protected blogsCollection: Model<BlogDocument>,
  ) {}

  async execute(command: CreateBlogCommand): Promise<Blog> {
    const newBlog = new this.blogsCollection(command.body);
    newBlog.id = +new Date() + '';
    newBlog.createdAt = new Date().toISOString();
    await this.blogsRepository.save(newBlog);
    return newBlog;
  }
}
