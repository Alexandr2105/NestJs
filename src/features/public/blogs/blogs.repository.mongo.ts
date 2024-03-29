import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogDocument } from './schema/blogs.schema';
import { BanUsersForBlogDocument } from './schema/ban.users.for.blog.schema';
import { IBlogsRepository } from './i.blogs.repository';
import { ImageModelDocument } from '../../../common/schemas/image.schema';

@Injectable()
export class BlogsRepositoryMongo extends IBlogsRepository {
  constructor(
    @InjectModel('blogs') private readonly blogsCollection: Model<BlogDocument>,
    @InjectModel('banUsersForBlogs')
    private readonly banUsersForBlogsCollection: Model<BanUsersForBlogDocument>,
    @InjectModel('image') private readonly image: Model<ImageModelDocument>,
  ) {
    super();
  }

  async getBlogIdSpecial(id: string): Promise<BlogDocument | false> {
    const blog = await this.blogsCollection
      .findOne({ id: id })
      .select('-__v -_id -userId -banStatus -banDate');
    if (blog) {
      return blog;
    } else {
      return false;
    }
  }

  async getBlogId(id: string): Promise<BlogDocument | false> {
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

  async getBanBlogs(idBlog: string) {
    return this.blogsCollection.findOne({ id: idBlog, banStatus: true });
  }

  async getBanUsersForBlogs(
    blogId: string,
  ): Promise<BanUsersForBlogDocument[]> {
    return this.banUsersForBlogsCollection.find({ blogId: blogId });
  }

  async deleteBanUsers(userId: string, blogId: string) {
    await this.banUsersForBlogsCollection.deleteOne({
      userId: userId,
      blogId: blogId,
    });
  }

  async saveBanUser(banUser: BanUsersForBlogDocument) {
    await banUser.save();
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }
}
