import { Injectable } from '@nestjs/common';
import { PostsModel } from '../helper/allTypes';

@Injectable()
export class PostsRepository {
  async getPostId(id: string): Promise<PostsModel | null> {
    return postsCollection.findOne({ id: id });
  }

  async deletePostId(id: string): Promise<boolean> {
    const result = await postsCollection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async updatePostId(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<boolean> {
    const updatePost = await postsCollection.updateOne(
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

  async createPost(newPost: PostsModel): Promise<ItemsPosts> {
    await postsCollection.create(newPost);
    return newPost;
  }

  // async createLikeStatus(likeStatus: LikeInfoTypeForDB): Promise<boolean> {
  //   const status = await likeInfoCollection.create(likeStatus);
  //   return !!status;
  // }
  //
  // async getLikesInfo(idPost: string): Promise<number> {
  //   const allLikes = await likeInfoCollection.find({
  //     id: idPost,
  //     status: { $regex: 'Like' },
  //   });
  //   if (allLikes) {
  //     return allLikes.length;
  //   } else {
  //     return 0;
  //   }
  // }
  //
  // async getDislikeInfo(idPost: string): Promise<number | undefined> {
  //   const allDislikes = await likeInfoCollection.find({
  //     id: idPost,
  //     status: { $regex: 'Dislike' },
  //   });
  //   if (allDislikes) {
  //     return allDislikes.length;
  //   }
  // }
  //
  // async getMyStatus(
  //   userId: string,
  //   postId: string,
  // ): Promise<string | undefined> {
  //   const commentInfo = await likeInfoCollection.findOne({
  //     userId: userId,
  //     id: postId,
  //   });
  //   if (commentInfo) {
  //     return commentInfo.status.toString();
  //   } else {
  //     return 'None';
  //   }
  // }
  //
  // async getAllInfoLike(postId: string): Promise<LikeInfoTypeForDB[]> {
  //   return likeInfoCollection
  //     .find({ id: postId, status: 'Like' })
  //     .sort({ ['createDate']: 'desc' })
  //     .limit(3);
  // }
  //
  // async getInfoStatusByPost(idPost: string, userId: string) {
  //   return likeInfoCollection.findOne({ id: idPost, userId: userId });
  // }
  //
  // async updateStatusPost(
  //   idPost: string,
  //   userId: string,
  //   status: string,
  // ): Promise<boolean> {
  //   const newStatusComment = await likeInfoCollection.updateOne(
  //     {
  //       id: idPost,
  //       userId: userId,
  //     },
  //     { $set: { status: status } },
  //   );
  //   return newStatusComment.matchedCount === 1;
  // }
}
