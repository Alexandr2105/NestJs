import { IImageRepository } from './i.image.repository';
import { ImageModelDocument } from '../../../common/schemas/image.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageRepositorySql implements IImageRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getInfoForImageByUrl(url: string) {
    const image = await this.dataSource.query(
      `SELECT * FROM public."Image"
            WHERE "url"=$1`,
      [url],
    );
    return image[0];
  }

  async getInfoForImageByBlogIdAndFolderName(
    blogId: string,
    folderName: string,
  ) {
    return await this.dataSource.query(
      `SELECT * FROM public."Image"
            WHERE "blogId"=$1 AND "folderName"=$2`,
      [blogId, folderName],
    );
  }

  async getInfoForImageByPostIdAndFolderName(
    postId: string,
    folderName: string,
  ) {
    return await this.dataSource.query(
      `SELECT * FROM public."Image"
            WHERE "postId"=$1 AND "folderName"=$2`,
      [postId, folderName],
    );
  }

  async saveImage(image: ImageModelDocument) {
    if (!(await this.getInfoForImageByUrl(image.url))) {
      const imageData = await this.dataSource.query(
        `INSERT INTO public."Image"(
            "id", "url", "bucket", "blogId", "postId","key","width","height",
            "fileSize","folderName")
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          image.id,
          image.url,
          image.bucket,
          image.blogId,
          image.postId,
          image.key,
          image.width,
          image.height,
          image.fileSize,
          image.folderName,
        ],
      );
      return imageData[0];
    } else {
      const imageData = await this.dataSource.query(
        `UPDATE public."Image"
            SET "id"=$1, "bucket"=$2, "blogId"=$3, "postId"=$4,"url"=$5,"width"=$6,
            "height"=$7,"fileSize"=$8,"folderName"=$9
            WHERE "key"=$10`,
        [
          image.id,
          image.bucket,
          image.blogId,
          image.postId,
          image.url,
          image.width,
          image.height,
          image.fileSize,
          image.folderName,
          image.key,
        ],
      );
      return imageData[0];
    }
  }
}
