import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikesModelDocument } from '../../../../../common/schemas/like.type.schema';
import { IPostsRepository } from '../../i.posts.repository';

export class CreateLikeStatusForPostsCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: string,
    public login: string,
  ) {}
}

@CommandHandler(CreateLikeStatusForPostsCommand)
export class CreateLikeStatusForPostsUseCase {
  constructor(
    private readonly postsRepository: IPostsRepository,
    @InjectModel('likeStatuses')
    private readonly likeInfoCollection: Model<LikesModelDocument>,
  ) {}

  async execute(command: CreateLikeStatusForPostsCommand): Promise<boolean> {
    const checkPost = await this.postsRepository.getInfoStatusByPost(
      command.postId,
      command.userId,
    );
    if (checkPost) {
      return await this.postsRepository.updateStatusPost(
        command.postId,
        command.userId,
        command.likeStatus,
      );
    } else {
      const newLikeStatusForPost = new this.likeInfoCollection();
      newLikeStatusForPost.id = command.postId;
      newLikeStatusForPost.userId = command.userId;
      newLikeStatusForPost.login = command.login;
      newLikeStatusForPost.status = command.likeStatus;
      newLikeStatusForPost.createDate = new Date().toISOString();
      return await this.postsRepository.createLikeStatus(newLikeStatusForPost);
    }
  }
}
