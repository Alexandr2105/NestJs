import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { IBlogsRepository } from '../../features/public/blogs/i.blogs.repository';
import { IPostsRepository } from '../../features/public/posts/i.posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImageModelDocument } from '../schemas/image.schema';

@Injectable()
export class FileStorageAdapterS3 {
  s3Client: S3Client;
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly postsRepository: IPostsRepository,
    @InjectModel('image')
    private readonly image: Model<ImageModelDocument>,
  ) {
    const REGION = 'us-east-1';
    this.s3Client = new S3Client({
      region: REGION,
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: 'YCAJEtOVWB3pHBNC0eqx4_8X8',
        secretAccessKey: 'YCOBApi-mSV7corUf51q4c9Hm-QdQBlJhK9v0An2',
      },
    });
  }

  async saveImageForBlog(
    userId: string,
    fileName: string,
    wallpaperBuffer: Buffer,
    folderName: string,
    blogId: string,
  ): Promise<ImageModelDocument> {
    const command = new PutObjectCommand({
      Bucket: 'my1bucket',
      Key: `images/${folderName}/${blogId}_blog.png`,
      Body: wallpaperBuffer,
      ContentType: 'image/png',
    });

    try {
      await this.s3Client.send(command);
      const newImage = new this.image();
      newImage.id = +new Date() + '';
      newImage.blogId = blogId;
      newImage.key = `images/${folderName}/${blogId}_blog.png`;
      newImage.bucket = 'my1bucket';
      return newImage;
    } catch (err) {
      console.error(err);
    }
  }

  async saveImageForPost(
    userId: string,
    fileName: string,
    wallpaperBuffer: Buffer,
    folderName: string,
    blogId: string,
    postId: string,
    infoSize: string,
  ): Promise<ImageModelDocument> {
    const command = new PutObjectCommand({
      Bucket: 'my1bucket',
      Key: `images/${folderName}/${postId}_post_${infoSize}.png`,
      Body: wallpaperBuffer,
      ContentType: 'image/png',
    });
    try {
      await this.s3Client.send(command);
      const newImage = new this.image();
      newImage.id = +new Date() + '';
      newImage.blogId = blogId;
      newImage.key = `images/${folderName}/${postId}_post_${infoSize}.png`;
      newImage.bucket = 'my1bucket';
      newImage.postId = postId;
      return newImage;
    } catch (err) {
      console.error(err);
    }
  }

  // async getImage(bucket: string, key: string) {
  //   const command = new GetObjectCommand({
  //     Bucket: bucket,
  //     Key: key,
  //   });
  //   const a = await this.s3Client.send(command);
  // }
}
