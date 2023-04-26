import { ImageModelDocument } from '../../../common/schemas/image.schema';

export abstract class IImageRepository {
  abstract saveImage(image: ImageModelDocument);
  abstract getInfoForImageByUrl(url: string);
  abstract getInfoForImageByBlogIdAndFolderName(
    blogId: string,
    folderName: string,
  );
  abstract getInfoForImageByPostIdAndFolderName(
    postId: string,
    folderName: string,
  );
}
