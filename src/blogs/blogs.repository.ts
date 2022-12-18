import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './schema/blogs.schema';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel('blogs') protected blogsCollection: Model<BlogDocument>,
  ) {}
  async getBlogsId(id: string): Promise<BlogDocument | false> {
    const blog = await this.blogsCollection.findOne({ id: id });
    if (blog) {
      return blog;
    } else {
      return false;
    }
  }

  async deleteBlogsId(id: string): Promise<boolean> {
    const result = await this.blogsCollection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async createBlog(newBlog: Blog): Promise<Blog> {
    await this.blogsCollection.create(newBlog);
    return newBlog;
    // const a = new this.blogsCollection(newBlog);
    // return a.save();
  }

  async updateBlog(
    id: string,
    name: string,
    url: string,
    description: string,
  ): Promise<boolean> {
    const updateBlog = await this.blogsCollection.updateOne(
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
