import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostDocument } from './schema/posts.schema';
import { LikesModelDocument } from '../../../common/schemas/like.type.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel('posts') protected postsCollection: Model<PostDocument>,
    @InjectModel('likeStatuses')
    protected likeInfoCollection: Model<LikesModelDocument>,
  ) {}

  async getPostId(id: string): Promise<PostDocument | null> {
    return this.postsCollection.findOne({ id: id });
  }

  async deletePostId(id: string): Promise<boolean> {
    const result = await this.postsCollection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async createLikeStatus(likeStatus: LikesModelDocument): Promise<boolean> {
    await likeStatus.save();
    return true;
  }

  async getLikesInfo(idPost: string): Promise<number> {
    const allLikes = await this.likeInfoCollection.find({
      id: idPost,
      status: { $regex: 'Like' },
    });
    if (allLikes) {
      return allLikes.length;
    } else {
      return 0;
    }
  }

  async getDislikeInfo(idPost: string): Promise<number | undefined> {
    const allDislikes = await this.likeInfoCollection.find({
      id: idPost,
      status: { $regex: 'Dislike' },
    });
    if (allDislikes) {
      return allDislikes.length;
    }
  }

  async getMyStatus(
    userId: string,
    postId: string,
  ): Promise<string | undefined> {
    const commentInfo = await this.likeInfoCollection.findOne({
      userId: userId,
      id: postId,
    });
    if (commentInfo) {
      return commentInfo.status.toString();
    } else {
      return 'None';
    }
  }

  async getAllInfoLike(postId: string): Promise<LikesModelDocument[]> {
    return this.likeInfoCollection
      .find({ id: postId, status: 'Like' })
      .sort({ ['createDate']: 'desc' })
      .limit(3);
  }

  async getInfoStatusByPost(idPost: string, userId: string) {
    return this.likeInfoCollection.findOne({ id: idPost, userId: userId });
  }

  async updateStatusPost(
    idPost: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    const newStatusComment = await this.likeInfoCollection.updateOne(
      {
        id: idPost,
        userId: userId,
      },
      { $set: { status: status } },
    );
    return newStatusComment.matchedCount === 1;
  }

  async save(post: PostDocument) {
    await post.save();
  }
}
