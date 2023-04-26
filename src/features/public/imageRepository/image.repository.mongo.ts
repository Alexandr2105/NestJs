import { IImageRepository } from './i.image.repository';
import { ImageModelDocument } from '../../../common/schemas/image.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class ImageRepositoryMongo implements IImageRepository {
  constructor(
    @InjectModel('image') private readonly image: Model<ImageModelDocument>,
  ) {}

  async getInfoForImageByUrl(url: string) {
    return this.image.findOne({ url: url });
  }

  async getInfoForImageByBlogIdAndFolderName(
    blogId: string,
    folderName: string,
  ) {
    return this.image.find({ blogId: blogId, folderName: folderName });
  }

  async getInfoForImageByPostIdAndFolderName(
    postId: string,
    folderName: string,
  ) {
    return this.image.find({ postId: postId, folderName: folderName });
  }

  async saveImage(image: ImageModelDocument) {
    await image.save();
  }
}
