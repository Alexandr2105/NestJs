import { Injectable } from '@nestjs/common';
import { checkDirectoryAsync, saveFileAsync } from '../utils/fs-utils';
import path from 'node:path';
import { unlink } from 'fs/promises';

@Injectable()
export class FileStorageAdapter {
  async saveImageForBlog(
    userId: string,
    fileName: string,
    wallpaperBuffer: Buffer,
    folderName: string,
    blogId: string,
  ) {
    await checkDirectoryAsync(
      path.join('common', 'images', userId, folderName),
    );
    await saveFileAsync(
      path.join('common', 'images', userId, folderName, fileName),
      wallpaperBuffer,
    );
  }

  async saveImageForPost(
    userId: string,
    fileName: string,
    wallpaperBuffer: Buffer,
    folderName: string,
    blogId: string,
    postId: string,
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
