import { CreateBlogDto } from '../dto/blog.dto';
import { Blog, BlogDocument } from '../schema/blogs.schema';
import { Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CreateBlogUseCase {
  constructor(
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @InjectModel('blogs') protected blogsCollection: Model<BlogDocument>,
  ) {}

  async execute(body: CreateBlogDto): Promise<Blog> {
    const newBlog = new this.blogsCollection(body);
    newBlog.id = +new Date() + '';
    newBlog.createdAt = new Date().toISOString();
    await this.blogsRepository.save(newBlog);
    return newBlog;
  }
}
