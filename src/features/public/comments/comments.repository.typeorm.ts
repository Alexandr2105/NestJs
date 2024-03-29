import { ICommentsRepository } from './i.comments.repository';
import { LikesModel } from '../../../common/schemas/like.type.schema';
import { CommentDocument } from './schema/comment.schema';
import { IUsersRepository } from '../../sa/users/i.users.repository';
import { Repository } from 'typeorm';
import { CommentEntity } from './entity/comment.entity';
import { LikeStatusEntity } from '../../../common/entity/like.status.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentsRepositoryTypeorm extends ICommentsRepository {
  constructor(
    private readonly usersRepository: IUsersRepository,
    @InjectRepository(CommentEntity)
    private readonly commentsCollection: Repository<CommentEntity>,
    @InjectRepository(LikeStatusEntity)
    private readonly likeInfoCollection: Repository<LikeStatusEntity>,
  ) {
    super();
  }
  async deleteCommentById(id: string): Promise<boolean> {
    const result = await this.commentsCollection.delete({ id: id });
    return result.affected === 1;
  }

  async getCommentById(id: string): Promise<CommentEntity | null> {
    return this.commentsCollection.findOneBy({ id: id });
  }

  async getDislikeInfo(idComment: string): Promise<number | undefined> {
    const allLikes = await this.likeInfoCollection.find({
      where: {
        commentId: idComment,
        status: 'Dislike',
        user: { ban: false },
      },
    });
    if (allLikes) {
      return allLikes.length;
    } else {
      return 0;
    }
  }

  async getInfoStatusByComment(idComment: string, userId: string) {
    return this.likeInfoCollection.findOneBy({ id: idComment, userId: userId });
  }

  async getLikesInfo(idComment: string): Promise<number> {
    const allLikes = await this.likeInfoCollection.find({
      where: {
        commentId: idComment,
        status: 'Like',
        user: { ban: false },
      },
    });
    if (allLikes) {
      return allLikes.length;
    } else {
      return 0;
    }
  }

  async getMyStatus(
    userId: string,
    commentId: string,
  ): Promise<string | undefined> {
    const commentInfo = await this.likeInfoCollection.findOneBy({
      userId: userId,
      commentId: commentId,
    });
    if (commentInfo) {
      return commentInfo.status.toString();
    } else {
      return 'None';
    }
  }

  async save(comment: CommentDocument) {
    await this.commentsCollection.save(comment);
  }

  async setLikeStatus(likeInfo: LikesModel): Promise<boolean> {
    const newModel = {
      ...likeInfo,
      id: +new Date() + '',
      commentId: likeInfo.id,
    };
    const info = await this.likeInfoCollection.save(newModel);
    return !!info;
  }

  async updateStatusComment(
    idComment: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    const newStatusComment = await this.likeInfoCollection.update(
      {
        id: idComment,
        userId: userId,
      },
      { status: status },
    );
    return newStatusComment.affected === 1;
  }
}
