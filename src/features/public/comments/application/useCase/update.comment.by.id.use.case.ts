import { CommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../../dto/comment.dto';
import { CommentsRepository } from '../../comments.repostitory';

export class UpdateCommentByIdCommand {
  constructor(public id: string, public body: UpdateCommentDto) {}
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdUseCase {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentByIdCommand): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(command.id);
    if (!comment) return false;
    comment.content = command.body.content;
    await this.commentsRepository.save(comment);
    return true;
  }
}
