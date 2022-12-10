import { PostsModel } from '../helper/allTypes';
import { PostsRepository } from './posts.repository';
import { Inject, Injectable } from '@nestjs/common';
import { BlogsService } from '../blogs/blogs.service';

@Injectable()
export class PostsService {
  constructor(
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(BlogsService) protected blogsService: BlogsService, // @inject(CommentsRepository) // protected commentsRepository: CommentsRepository,
  ) {}

  async getPostId(id: string) {
    const post = await this.postsRepository.getPostId(id);
    const likesCount = await this.postsRepository.getLikesInfo(id);
    const dislikeCount: any = await this.postsRepository.getDislikeInfo(id);
    const myStatus: any = await this.postsRepository.getMyStatus(userId, id);
    const infoLikes = await this.postsRepository.getAllInfoLike(id);
    if (post) {
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikeCount,
          myStatus: myStatus,
          newestLikes: infoLikes.map((a) => {
            return {
              addedAt: a.createDate,
              userId: a.userId,
              login: a.login,
            };
          }),
        },
      };
    } else {
      return false;
    }
  }

  async deletePostId(id: string): Promise<boolean> {
    return await this.postsRepository.deletePostId(id);
  }

  async updatePostId(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<boolean> {
    return await this.postsRepository.updatePostId(
      id,
      title,
      shortDescription,
      content,
      blogId,
    );
  }

  async createPost(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<PostsModel> {
    const post: any = await this.blogsService.getBlogsId(blogId);
    const newPost = new PostsModel(
      +new Date() + '',
      title,
      shortDescription,
      content,
      blogId,
      post.name,
      new Date().toISOString(),
    );
    return this.postsRepository.createPost(newPost);
  }

  async creatNewCommentByPostId(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentsTypeForDB | boolean> {
    const idPost = await this.postsRepository.getPostId(postId);
    if (idPost) {
      const newComment = new CommentsTypeForDB(
        +new Date() + '',
        postId,
        content,
        userId,
        userLogin,
        new Date().toISOString(),
      );
      return await this.commentsRepository.createComment(newComment);
    } else {
      return false;
    }
  }

  async createLikeStatus(
    postId: string,
    userId: string,
    likeStatus: string,
    login: string,
  ): Promise<boolean> {
    const checkPost = await this.postsRepository.getInfoStatusByPost(
      postId,
      userId,
    );
    if (checkPost) {
      return await this.postsRepository.updateStatusPost(
        postId,
        userId,
        likeStatus,
      );
    } else {
      const newLikeStatusForPost = new LikeInfoTypeForDB(
        postId,
        userId,
        login,
        likeStatus,
        new Date().toISOString(),
      );
      return await this.postsRepository.createLikeStatus(newLikeStatusForPost);
    }
  }
}
