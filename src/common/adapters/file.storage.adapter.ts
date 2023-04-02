import { Injectable } from '@nestjs/common';
import { checkDirectoryAsync, saveFileAsync } from '../utils/fs-utils';
import path from 'node:path';
import { unlink } from 'fs/promises';

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

  async deleteFile(fileId: string) {
    await unlink(fileId);
  }
}
