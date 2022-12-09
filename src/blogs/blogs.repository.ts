import { Injectable } from '@nestjs/common';
import { ItemsBlogs } from '../helper/allTypes';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel('blogs') protected blogsModel: Model<ItemsBlogs>) {}
  async getBlogsId(id: string): Promise<ItemsBlogs | boolean> {
    const blog = await this.blogsModel.findOne({ id: id });
    if (blog) {
      return {
        id: blog.id,
        websiteUrl: blog.websiteUrl,
        description: blog.description,
        name: blog.name,
        createdAt: blog.createdAt,
      };
    } else {
      return false;
    }
  }

  async deleteBlogsId(id: string): Promise<boolean> {
    const result = await this.blogsModel.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async createBlog(newBlog: ItemsBlogs): Promise<ItemsBlogs> {
    await this.blogsModel.create(newBlog);
    return newBlog;
  }

  async updateBlog(
    id: string,
    name: string,
    url: string,
    description: string,
  ): Promise<boolean> {
    const updateBlog = await this.blogsModel.updateOne(
      { id: id },
      {
        $set: {
          name: name,
          websiteUrl: url,
          description: description,
        },
      },
    );
    return updateBlog.matchedCount === 1;
  }
}
