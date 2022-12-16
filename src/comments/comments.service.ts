import { Inject, Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repostitory';
import { ItemsComments, LikesModel } from '../helper/allTypes';

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

  async updateCommentById(id: string, content: string) {
    return await this.commentsRepository.updateCommentById(id, content);
  }

  async getLikesInfo(
    idComment: string,
    userId: string,
  ): Promise<boolean | ItemsComments> {
    const comment = await this.getCommentById(idComment);
    const likeStatus: any = await this.commentsRepository.getLikesInfo(
      idComment,
    );
    const dislikeStatus: any = await this.commentsRepository.getDislikeInfo(
      idComment,
    );
    const myStatus: any = await this.commentsRepository.getMyStatus(
      userId,
      idComment,
    );
    if (comment) {
      return {
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        userLogin: comment.userLogin,
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

  async createLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: string,
    login: string,
  ) {
    const checkComment = await this.commentsRepository.getInfoStatusByComment(
      commentId,
      userId,
    );
    if (checkComment) {
      return await this.commentsRepository.updateStatusComment(
        commentId,
        userId,
        likeStatus,
      );
    } else {
      const statusComment: LikesModel = {
        id: commentId,
        userId: userId,
        login: login,
        status: likeStatus,
        createDate: new Date().toISOString(),
      };
      return await this.commentsRepository.setLikeStatus(statusComment);
    }
  }
}
