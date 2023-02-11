import { CommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../../dto/comment.dto';
import { ICommentsRepository } from '../../i.comments.repository';

export class UpdateCommentByIdCommand {
  constructor(public id: string, public body: UpdateCommentDto) {}
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdUseCase {
  constructor(private readonly commentsRepository: ICommentsRepository) {}

  async execute(command: UpdateCommentByIdCommand): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(command.id);
    if (!comment) return false;
    comment.content = command.body.content;
    await this.commentsRepository.save(comment);
    return true;
  }
}
