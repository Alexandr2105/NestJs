import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsService } from '../../features/public/comments/application/comments.service';

@ValidatorConstraint({ name: 'comment', async: true })
@Injectable()
export class CheckIdComment implements ValidatorConstraintInterface {
  constructor(
    @Inject(CommentsService) protected commentService: CommentsService,
  ) {}

  async validate(id: string): Promise<any> {
    const comment = await this.commentService.getCommentById(id);
    if (!comment) {
      throw new NotFoundException();
    }
    if (comment.id) {
    } else {
      throw new ForbiddenException();
    }
  }

  defaultMessage(): string {
    return 'Ошибка';
  }
}
