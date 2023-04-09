import { IBlogsRepository } from './i.blogs.repository';
import { BlogDocument } from './schema/blogs.schema';
import { BanUsersForBlogDocument } from './schema/ban.users.for.blog.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ImageModelDocument } from '../../../common/schemas/image.schema';

@Injectable()
export class BlogsRepositorySql extends IBlogsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async deleteBanUsers(userId: string, blogId: string) {
    await this.dataSource.query(
      `DELETE FROM public."BanUsersForBlog"
            WHERE "userId"=$1 AND "blogId"=$2`,
      [userId, blogId],
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
            SET "name"=$1, "websiteUrl"=$2, "description"=$3, 
            "createdAt"=$4, "userId"=$5, "banDate"=$6, "isMembership"=$7, "banStatus"=$8
            WHERE "id"=$9`,
        [
          blog.name,
          blog.websiteUrl,
          blog.description,
          blog.createdAt,
          blog.userId,
          blog.banDate,
          blog.isMembership,
          blog.banStatus,
          blog.id,
        ],
      );
    }
  }

  async saveBanUser(banUser: BanUsersForBlogDocument) {
    if (!(await this.getBanUserForBlog(banUser.blogId, banUser.userId))) {
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

  async getBanUserForBlog(blogId: string, userId: string) {
    const banUser = await this.dataSource.query(
      `SELECT * FROM public."BanUsersForBlog"
            WHERE "blogId"=$1 AND "userId"=$2`,
      [blogId, userId],
    );
    return banUser[0];
  }

  async getInfoForImage(url: string) {
    const image = await this.dataSource.query(
      `SELECT * FROM public."Image"
            WHERE "url"=$1`,
      [url],
    );
    return image[0];
  }

  async saveImage(image: ImageModelDocument) {
    if (!(await this.getInfoForImage(image.url))) {
      const imageData = await this.dataSource.query(
        `INSERT INTO public."Image"(
            "id", "url", "bucket", "blogId")
            VALUES ($1,$2,$3,$4)`,
        [image.id, image.url, image.bucket, image.blogId],
      );
      return imageData[0];
    } else {
      const imageData = await this.dataSource.query(
        `UPDATE public."Image"
            SET "id"=$1, "bucket"=$2, "blogId"=$3
            WHERE "url"=$4`,
        [image.id, image.bucket, image.blogId, image.url],
      );
      return imageData[0];
    }
  }
}
