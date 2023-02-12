import { IBlogsRepository } from './i.blogs.repository';
import { BlogDocument } from './schema/blogs.schema';
import { BanUsersForBlogDocument } from './schema/ban.users.for.blog.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class BlogsRepositorySql extends IBlogsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async deleteBanUsers(userId: string) {
    await this.dataSource.query(
      `DELETE FROM public."BanUsersForBlog"
            WHERE "userId"=$1`,
      [userId],
    );
  }

  async deleteBlogId(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM public."Blogs"
            WHERE "id"=$1`,
      [id],
    );
    return result[1] === 1;
  }

  async getBanBlogs(idBlog: string) {
    const banBlogs = this.dataSource.query(
      `SELECT * FROM public."Blogs"
            WHERE "id"=$1 AND "banStatus"=true`,
      [idBlog],
    );
    return banBlogs[0];
  }

  async getBanUsersForBlogs(
    blogId: string,
  ): Promise<BanUsersForBlogDocument[]> {
    return this.dataSource.query(
      `SELECT * FROM public."BanUsersForBlog"
            WHERE "blogId"=$1`,
      [blogId],
    );
  }

  async getBlogId(id: string): Promise<BlogDocument | false> {
    const blog = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
            WHERE "id"=$1`,
      [id],
    );
    if (blog[0]) {
      return blog[0];
    } else {
      return false;
    }
  }

  async getBlogIdSpecial(id: string): Promise<BlogDocument | false> {
    const blog = await this.dataSource.query(
      `SELECT "id","name","websiteUrl","description","createdAt","isMembership" 
            FROM public."Blogs"
            WHERE "id"=$1`,
      [id],
    );
    if (blog[0]) {
      return blog[0];
    } else {
      return false;
    }
  }

  async save(blog: BlogDocument) {
    if (!(await this.getBlogId(blog.id))) {
      await this.dataSource.query(
        `INSERT INTO public."Blogs"(
            "name", "websiteUrl", "description","id","createdAt","userId","banStatus","isMembership")
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          blog.name,
          blog.websiteUrl,
          blog.description,
          blog.id,
          blog.createdAt,
          blog.userId,
          blog.banStatus,
          blog.isMembership,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public."Blogs"
            SET "name"=$1, "websiteUrl"=$2, "description"=$3
            WHERE "id"=$4`,
        [blog.name, blog.websiteUrl, blog.description, blog.id],
      );
    }
  }

  async saveBanUser(banUser: BanUsersForBlogDocument) {
    if (!(await this.getBanUserForBlog(banUser.userId, banUser.blogId))) {
      await this.dataSource.query(
        `INSERT INTO public."BanUsersForBlog"(
            "blogId", "userId", "isBanned", "banReason", "banDate")
            VALUES ($1,$2,$3,$4,$5)`,
        [
          banUser.blogId,
          banUser.userId,
          banUser.isBanned,
          banUser.banReason,
          banUser.banDate,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public."BanUsersForBlog"
            SET "isBanned"=$1, "banReason"=$2, "banDate"=$3
            WHERE "userId"=$4 AND "blogId"=$5`,
        [
          banUser.isBanned,
          banUser.banReason,
          banUser.banDate,
          banUser.userId,
          banUser.blogId,
        ],
      );
    }
  }

  async getBanUserForBlog(idBlog: string, userId: string) {
    const banUser = this.dataSource.query(
      `SELECT * FROM public."BanUsersForBlog"
            WHERE "blogId"=$1 AND "userId"=$2`,
      [idBlog, userId],
    );
    return banUser[0];
  }
}
