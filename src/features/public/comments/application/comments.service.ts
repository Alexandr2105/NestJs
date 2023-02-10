import { Inject, Injectable } from '@nestjs/common';
import { CommentsRepositoryMongo } from '../comments.repostitory.mongo';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(CommentsRepositoryMongo)
    protected commentsRepository: CommentsRepositoryMongo,
  ) {}

  async getCommentById(id: string) {
    return await this.commentsRepository.getCommentById(id);
  }

  async deleteCommentById(id: string) {
    return await this.commentsRepository.deleteCommentById(id);
  }
}
