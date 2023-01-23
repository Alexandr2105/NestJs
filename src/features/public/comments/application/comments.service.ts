import { Inject, Injectable } from '@nestjs/common';
import { CommentsRepository } from '../comments.repostitory';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(CommentsRepository)
    protected commentsRepository: CommentsRepository,
  ) {}

  async getCommentById(id: string) {
    return await this.commentsRepository.getCommentById(id);
  }

  async deleteCommentById(id: string) {
    return await this.commentsRepository.deleteCommentById(id);
  }
}
