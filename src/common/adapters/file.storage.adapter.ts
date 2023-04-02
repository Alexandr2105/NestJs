import { Injectable } from '@nestjs/common';
import { checkDirectoryAsync, saveFileAsync } from '../utils/fs-utils';
import path from 'node:path';

@Injectable()
export class FileStorageAdapter {
  async saveAvatar(
    userId: string,
    fileName: string,
    wallpaperBuffer: Buffer,
    folderName: string,
  ) {
    await checkDirectoryAsync(
      path.join('common', 'images', userId, folderName),
    );
    await saveFileAsync(
      path.join('common', 'images', userId, folderName, fileName),
      wallpaperBuffer,
    );
  }
}
