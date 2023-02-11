import { Inject, Injectable } from '@nestjs/common';
import { ICommentsRepository } from '../i.comments.repository';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(ICommentsRepository)
    private readonly commentsRepository: ICommentsRepository,
  ) {}

  async getCommentById(id: string) {
    return await this.commentsRepository.getCommentById(id);
  }

  async deleteCommentById(id: string) {
    return await this.commentsRepository.deleteCommentById(id);
  }
}
