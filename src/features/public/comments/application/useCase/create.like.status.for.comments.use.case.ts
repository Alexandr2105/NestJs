import { CommandHandler } from '@nestjs/cqrs';
import { LikesModel } from '../../../../../common/schemas/like.type.schema';
import { CommentsRepository } from '../../comments.repostitory';

export class CreateLikeStatusForCommentsCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: string,
    public login: string,
  ) {}
}

@CommandHandler(CreateLikeStatusForCommentsCommand)
export class CreateLikeStatusForCommentsUseCase {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(command: CreateLikeStatusForCommentsCommand) {
    const checkComment = await this.commentsRepository.getInfoStatusByComment(
      command.commentId,
      command.userId,
    );
    if (checkComment) {
      return await this.commentsRepository.updateStatusComment(
        command.commentId,
        command.userId,
        command.likeStatus,
      );
    } else {
      const statusComment: LikesModel = {
        id: command.commentId,
        userId: command.userId,
        login: command.login,
        status: command.likeStatus,
        createDate: new Date().toISOString(),
      };
      return await this.commentsRepository.setLikeStatus(statusComment);
    }
  }
}
