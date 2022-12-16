import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikesModel, PostsModel } from '../helper/allTypes';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel('posts') protected postsCollection: Model<PostsModel>,
    @InjectModel('likeStatuses')
    protected likeInfoCollection: Model<LikesModel>,
  ) {}

  async getPostId(id: string): Promise<PostsModel | null> {
    return this.postsCollection.findOne({ id: id });
  }

  async deletePostId(id: string): Promise<boolean> {
    const result = await this.postsCollection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async updatePostId(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<boolean> {
    const updatePost = await this.postsCollection.updateOne(
      { id: id },
      {
        $set: {
          title: title,
          shortDescription: shortDescription,
          content: content,
          blogId: blogId,
        },
      },
    );
    return updatePost.matchedCount === 1;
  }

  async createPost(newPost: PostsModel): Promise<PostsModel> {
    await this.postsCollection.create(newPost);
    return newPost;
  }

  async createLikeStatus(likeStatus: LikesModel): Promise<boolean> {
    const status = await this.likeInfoCollection.create(likeStatus);
    return !!status;
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

  async getAllInfoLike(postId: string): Promise<LikesModel[]> {
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
}
