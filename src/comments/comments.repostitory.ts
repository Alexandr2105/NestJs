import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentDocument } from './schema/comment.schema';
import { LikesModel, LikesModelDocument } from '../schemas/like.type.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel('comments')
    protected commentsCollection: Model<CommentDocument>,
    @InjectModel('likeStatuses')
    protected likeInfoCollection: Model<LikesModelDocument>,
  ) {}

  async getCommentById(id: string): Promise<CommentDocument | null> {
    return this.commentsCollection.findOne({ id: id });
  }

  async deleteCommentById(id: string): Promise<boolean> {
    const result = await this.commentsCollection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async getLikesInfo(idComment: string): Promise<number> {
    const allLikes = await this.likeInfoCollection.find({
      id: idComment,
      status: { $regex: 'Like' },
    });
    if (allLikes) {
      return allLikes.length;
    } else {
      return 0;
    }
  }

  async getDislikeInfo(idComment: string): Promise<number | undefined> {
    const allDislikes = await this.likeInfoCollection.find({
      id: idComment,
      status: { $regex: 'Dislike' },
    });
    if (allDislikes) {
      return allDislikes.length;
    }
  }

  async getMyStatus(
    userId: string,
    commentId: string,
  ): Promise<string | undefined> {
    const commentInfo = await this.likeInfoCollection.findOne({
      userId: userId,
      id: commentId,
    });
    if (commentInfo) {
      return commentInfo.status.toString();
    } else {
      return 'None';
    }
  }

  async setLikeStatus(likeInfo: LikesModel): Promise<boolean> {
    const info = await this.likeInfoCollection.create(likeInfo);
    return !!info;
  }

  async getInfoStatusByComment(idComment: string, userId: string) {
    return this.likeInfoCollection.findOne({ id: idComment, userId: userId });
  }

  async updateStatusComment(
    idComment: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    const newStatusComment = await this.likeInfoCollection.updateOne(
      {
        id: idComment,
        userId: userId,
      },
      { $set: { status: status } },
    );
    return newStatusComment.matchedCount === 1;
  }

  async save(comment: CommentDocument) {
    await comment.save();
  }
}
