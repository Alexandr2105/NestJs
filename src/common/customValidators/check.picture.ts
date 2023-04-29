import sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';

export class CheckPicture {
  async validateWallpaperForBlog(main: Express.Multer.File) {
    const arrayErrors = [];
    if (main.mimetype !== 'image/jpeg') {
      arrayErrors.push({ message: 'Не верное значение', field: 'format' });
      throw new BadRequestException(arrayErrors);
    }
    const checkImages = await sharp(main.buffer).metadata();
    if (checkImages.size > 100000)
      arrayErrors.push({ message: 'Не верное значение', field: 'size' });
    if (checkImages.width !== 1028)
      arrayErrors.push({ message: 'Не верное значение', field: 'width' });
    if (checkImages.height !== 312)
      arrayErrors.push({ message: 'Не верное значение', field: 'height' });
    if (arrayErrors.length > 0) throw new BadRequestException(arrayErrors);
  }

  async validateMainSquareForBlog(main: Express.Multer.File) {
    const arrayErrors = [];
    if (main.mimetype !== 'image/jpeg') {
      arrayErrors.push({ message: 'Не верное значение', field: 'format' });
      throw new BadRequestException(arrayErrors);
    }
    const checkImages = await sharp(main.buffer).metadata();
    if (checkImages.size > 100000)
      arrayErrors.push({ message: 'Не верное значение', field: 'size' });
    if (checkImages.width !== 156)
      arrayErrors.push({ message: 'Не верное значение', field: 'width' });
    if (checkImages.height !== 156)
      arrayErrors.push({ message: 'Не верное значение', field: 'height' });
    if (arrayErrors.length > 0) throw new BadRequestException(arrayErrors);
  }

  async validateMainForPost(main: Express.Multer.File) {
    const arrayErrors = [];
    if (main.mimetype !== 'image/jpeg') {
      arrayErrors.push({ message: 'Не верное значение', field: 'format' });
      throw new BadRequestException(arrayErrors);
    }
    const checkImages = await sharp(main.buffer).metadata();
    if (checkImages.size > 100000)
      arrayErrors.push({ message: 'Не верное значение', field: 'size' });
    if (checkImages.width !== 940)
      arrayErrors.push({ message: 'Не верное значение', field: 'width' });
    if (checkImages.height !== 432)
      arrayErrors.push({ message: 'Не верное значение', field: 'height' });
    if (arrayErrors.length > 0) throw new BadRequestException(arrayErrors);
  }
}
