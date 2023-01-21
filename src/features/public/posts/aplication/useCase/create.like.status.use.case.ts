import { CommandHandler } from '@nestjs/cqrs';
import { CreatePostByIdCommand } from '../../../../blogger/application/useCase/create.post.by.id.use.case';
import { PostsRepository } from '../../posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikesModelDocument } from '../../../../../common/schemas/like.type.schema';

export class CreateLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: string,
    public login: string,
  ) {}
}

@CommandHandler(CreatePostByIdCommand)
export class CreateLikeStatusUseCase {
  constructor(
    protected postsRepository: PostsRepository,
    @InjectModel('likeStatuses')
    protected likeInfoCollection: Model<LikesModelDocument>,
  ) {}

  async execute(command: CreateLikeStatusCommand): Promise<boolean> {
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
