import { ItemsComments } from '../../../../../common/helper/allTypes';
import { CommandHandler } from '@nestjs/cqrs';
import { ICommentsRepository } from '../../i.comments.repository';

export class GetLikesInfoCommand {
  constructor(public idComment: string, public userId: string) {}
}

@CommandHandler(GetLikesInfoCommand)
export class GetLikesInfoUseCase {
  constructor(private readonly commentsRepository: ICommentsRepository) {}

  async execute(
    command: GetLikesInfoCommand,
  ): Promise<boolean | ItemsComments> {
    const comment = await this.commentsRepository.getCommentById(
      command.idComment,
    );
    const likeStatus: any = await this.commentsRepository.getLikesInfo(
      command.idComment,
    );
    const dislikeStatus: any = await this.commentsRepository.getDislikeInfo(
      command.idComment,
    );
    const myStatus: any = await this.commentsRepository.getMyStatus(
      command.userId,
      command.idComment,
    );
    if (comment) {
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: likeStatus,
          dislikesCount: dislikeStatus,
          myStatus: myStatus,
        },
      };
    } else {
      return false;
    }
  }
}
