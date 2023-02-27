import { IBlogsRepository } from './i.blogs.repository';
import { BanUsersForBlogDocument } from './schema/ban.users.for.blog.schema';
import { BlogDocument } from './schema/blogs.schema';
import { Repository } from 'typeorm';
import { BlogEntity } from './entity/blog.entity';
import { BanUsersForBlogEntity } from './entity/ban.users.for.blog.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BlogsRepositoryTypeorm extends IBlogsRepository {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    @InjectRepository(BanUsersForBlogEntity)
    private readonly banUsersForBlog: Repository<BanUsersForBlogEntity>,
  ) {
    super();
  }

  async deleteBanUsers(userId: string) {
    await this.banUsersForBlog.delete(userId);
  }

  async deleteBlogId(id: string): Promise<boolean> {
    const result = await this.blogsRepository.delete(id);
    return result.affected === 1;
  }

  async getBanBlogs(idBlog: string) {
    return this.banUsersForBlog.findOneBy({ blogId: idBlog });
  }

  async getBanUsersForBlogs(blogId: string): Promise<BanUsersForBlogEntity[]> {
    return this.banUsersForBlog.findBy({ blogId: blogId });
  }

  async getBlogId(id: string): Promise<BlogEntity | false> {
    return this.blogsRepository.findOneBy({ id: id });
  }

  async getBlogIdSpecial(id: string): Promise<BlogEntity | false> {
    return this.blogsRepository.findOne({
      where: { id: id },
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
      },
    });
  }

  async save(blog: BlogDocument) {
    await this.blogsRepository.save(blog);
  }

  async saveBanUser(banUser: BanUsersForBlogDocument) {
    await this.banUsersForBlog.save(banUser);
  }
}
