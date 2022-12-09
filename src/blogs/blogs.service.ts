import { Inject, Injectable } from '@nestjs/common';
import { ItemsBlogs } from '../helper/allTypes';
import { BlogsRepository } from './blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
  ) {}

  async getBlogsId(id: string): Promise<ItemsBlogs | boolean> {
    return this.blogsRepository.getBlogsId(id);
  }

  async deleteBlogsId(id: string): Promise<boolean> {
    return this.blogsRepository.deleteBlogsId(id);
  }

  async createBlog(
    name: string,
    description: string,
    url: string,
  ): Promise<ItemsBlogs> {
    const dateNow = +new Date() + '';
    const newBlog: ItemsBlogs = {
      id: dateNow,
      name: name,
      websiteUrl: url,
      description: description,
      createdAt: new Date().toISOString(),
    };
    return await this.blogsRepository.createBlog(newBlog);
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
