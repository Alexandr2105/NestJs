import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogDocument } from './schema/blogs.schema';
import { BlogsSaDto } from '../../sa/blogs/dto/blogs.sa.dto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel('blogs') protected blogsCollection: Model<BlogDocument>,
  ) {}
  async getBlogId(id: string): Promise<BlogDocument | false> {
    const blog = await this.blogsCollection
      .findOne({ id: id })
      .select('-__v -_id -userId');
    if (blog) {
      return blog;
    } else {
      return false;
    }
  }

  async getBlogDocument(id: string): Promise<BlogDocument | false> {
    const blog = await this.blogsCollection.findOne({ id: id });
    if (blog) {
      return blog;
    } else {
      return false;
    }
  }

  async deleteBlogId(id: string): Promise<boolean> {
    const result = await this.blogsCollection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async updateBlogOwner(params: BlogsSaDto) {
    const blog = await this.blogsCollection.findOne({ id: params.blogId });
    blog.userId = params.userId;
    await this.save(blog);
  }

  async getAllInfoAboutBlogId(id: string) {
    const blog = await this.blogsCollection.findOne({ id: id });
    if (blog) {
      return blog;
    } else {
      throw new NotFoundException();
    }
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }
}
