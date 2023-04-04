import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class FileStorageAdapterS3 {
  s3Client: S3Client;
  constructor() {
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

  async saveAvatar(
    userId: string,
    fileName: string,
    wallpaperBuffer: Buffer,
    folderName: string,
  ) {
    const command = new PutObjectCommand({
      Bucket: 'my1bucket',
      Key: `images/${folderName}/${userId}.png`,
      Body: wallpaperBuffer,
      ContentType: 'image/png',
    });

    try {
      const uploadResult = await this.s3Client.send(command);
      console.log(uploadResult);
    } catch (err) {
      console.error(err);
    }
  }

  // async deleteFile(fileId: string) {}
}
