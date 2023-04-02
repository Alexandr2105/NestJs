import { CommandHandler } from '@nestjs/cqrs';
import { FileStorageAdapter } from '../../../../../common/adapters/file.storage.adapter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IPostsRepository } from '../../../../public/posts/i.posts.repository';

export class UploadPictureForPostCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public postId: string,
    public wallpaperName: string,
    public wallpaperBuffer: Buffer,
    public folderName: string,
  ) {}
}

@CommandHandler(UploadPictureForPostCommand)
export class UploadPictureForPostUserCase {
  constructor(
    private readonly postRepository: IPostsRepository,
    private readonly fileStorageAdapter: FileStorageAdapter,
  ) {}

  async execute(command: UploadPictureForPostCommand) {
    const post = await this.postRepository.getPostId(command.postId);
    if (!post) throw new NotFoundException();
    if (post.userId !== command.userId || post.blogId !== command.blogId)
      throw new ForbiddenException();
    const result = await this.fileStorageAdapter.saveAvatar(
      command.userId,
      command.wallpaperName,
      command.wallpaperBuffer,
      command.folderName,
    );
    return result;
  }
}
