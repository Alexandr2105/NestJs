import { CommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../../dto/comment.dto';
import { CommentsRepositoryMongo } from '../../comments.repostitory.mongo';

export class UpdateCommentByIdCommand {
  constructor(public id: string, public body: UpdateCommentDto) {}
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdUseCase {
  constructor(protected commentsRepository: CommentsRepositoryMongo) {}

  async execute(command: UpdateCommentByIdCommand): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(command.id);
    if (!comment) return false;
    comment.content = command.body.content;
    await this.commentsRepository.save(comment);
    return true;
  }
}
