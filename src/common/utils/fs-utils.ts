import fs from 'node:fs';
import path, { dirname } from 'node:path';

/*
 * relative root of running app
 */
export const readTextFileAsync = (relativePath: string) => {
  return new Promise((resolve, reject) => {
    const rootDirPath = dirname(require.main.filename);
    const fiePath = path.resolve(rootDirPath, relativePath);
    fs.readFile(fiePath, { encoding: 'utf-8' }, (err, content) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(content);
    });
  });
};

/*
 * write file
 * */
export const saveFileAsync = (relativePath: string, data: Buffer) => {
  return new Promise<void>((resolve, reject) => {
    const rootDirPath = dirname(require.main.filename);
    const filePath = path.resolve(rootDirPath, relativePath);
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

/*
 * Check Directory
 * */
export const checkDirectoryAsync = (relativePath: string) => {
  const rootDirPath = dirname(require.main.filename);
  const filePath = path.resolve(rootDirPath, relativePath);
  return new Promise<void>((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (!stats) {
        fs.mkdir(filePath, { recursive: true }, (err) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve();
        });
      }
    });
  });
};
