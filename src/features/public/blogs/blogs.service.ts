import { Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { BlogDocument } from './schema/blogs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @InjectModel('blogs') protected blogsCollection: Model<BlogDocument>,
  ) {}

  // async getBlogsId(id: string): Promise<BlogDocument | false> {
  //   const blog = await this.blogsRepository.getBlogId(id);
  //   if (!blog) return false;
  //   return blog;
  // }

  // async deleteBlogsId(id: string): Promise<boolean> {
  //   return this.blogsRepository.deleteBlogId(id);
  // }

  // async createBlog(body: CreateBlogDto): Promise<Blog> {
  //   const newBlog = new this.blogsCollection(body);
  //   newBlog.id = +new Date() + '';
  //   newBlog.createdAt = new Date().toISOString();
  //   await this.blogsRepository.save(newBlog);
  //   return newBlog;
  // }

  // async updateBlog(id: string, body: UpdateBlogDto): Promise<boolean> {
  //   const blog = await this.blogsRepository.getBlogDocument(id);
  //   if (!blog) return false;
  //   blog.name = body.name;
  //   blog.websiteUrl = body.websiteUrl;
  //   blog.description = body.description;
  //   await this.blogsRepository.save(blog);
  //   return true;
  // }
}
