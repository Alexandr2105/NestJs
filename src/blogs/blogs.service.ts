import { Inject, Injectable } from '@nestjs/common';
import { BlogsModel } from '../helper/allTypes';
import { BlogsRepository } from './blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
  ) {}

  async getBlogsId(id: string): Promise<BlogsModel | false> {
    const blog = await this.blogsRepository.getBlogsId(id);
    if (!blog) return false;
    return {
      id: blog.id,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      name: blog.name,
      createdAt: blog.createdAt,
    };
  }

  async deleteBlogsId(id: string): Promise<boolean> {
    return this.blogsRepository.deleteBlogsId(id);
  }

  async createBlog(
    name: string,
    description: string,
    url: string,
  ): Promise<BlogsModel> {
    const dateNow = +new Date() + '';
    const newBlog: BlogsModel = {
      id: dateNow,
      name: name,
      websiteUrl: url,
      description: description,
      createdAt: new Date().toISOString(),
    };
    return;
    // return await this.blogsRepository.createBlog(newBlog);
  }

  async updateBlog(
    id: string,
    name: string,
    url: string,
    description: string,
  ): Promise<boolean> {
    return this.blogsRepository.updateBlog(id, name, url, description);
  }
}
