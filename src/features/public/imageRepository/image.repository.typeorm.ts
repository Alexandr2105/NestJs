import { IImageRepository } from './i.image.repository';
import { ImageModelDocument } from '../../../common/schemas/image.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from '../../../common/entity/image.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageRepositoryTypeorm implements IImageRepository {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly image: Repository<ImageEntity>,
  ) {}

  async getInfoForImageByUrl(url: string) {
    return this.image.findOneBy({ url: url });
  }

  async getInfoForImageByBlogIdAndFolderName(
    blogId: string,
    folderName: string,
  ) {
    return this.image.findBy({
      blogId: blogId,
      folderName: folderName,
    });
  }

  async getInfoForImageByPostIdAndFolderName(
    postId: string,
    folderName: string,
  ) {
    return this.image.findBy({
      postId: postId,
      folderName: folderName,
    });
  }

  async saveImage(image: ImageModelDocument) {
    await this.image.save(image);
  }
}
