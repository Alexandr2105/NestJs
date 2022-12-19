import { CommentsModel, LikesModel } from '../helper/allTypes';
import { PostsRepository } from './posts.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CommentsRepository } from '../comments/comments.repostitory';
import { Post, PostDocument } from './schema/posts.schema';
import { CreatePostDto, UpdatePostDto } from './dto/postDto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostsService {
  constructor(
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(CommentsRepository)
    protected commentsRepository: CommentsRepository,
    @InjectModel('posts') protected postsCollection: Model<PostDocument>,
  ) {}

  async getPostId(id: string, userId: string) {
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

  async updatePostId(id: string, body: UpdatePostDto): Promise<boolean> {
    const post = await this.postsRepository.getPostId(id);
    if (!post) return false;
    post.content = body.content;
    post.title = body.title;
    post.shortDescription = body.shortDescription;
    post.blogId = body.blogId;
    await this.postsRepository.save(post);
    return true;
  }

  async createPost(body: CreatePostDto): Promise<Post | false> {
    //TODO:тут исправить
    const infoBlog = await this.blogsRepository.getBlogId(body.blogId);
    if (!infoBlog) return false; //TODO:тут лишшяя проверка
    const newPost = new this.postsCollection(body);
    newPost.createdAt = new Date().toISOString();
    newPost.id = +new Date() + '';
    newPost.blogName = infoBlog.name;
    await this.postsRepository.save(newPost);
    return newPost;
  }

  async creatNewCommentByPostId(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentsModel | boolean> {
    const idPost = await this.postsRepository.getPostId(postId);
    if (idPost) {
      const newComment: CommentsModel = {
        id: +new Date() + '',
        idPost: postId,
        content: content,
        userId: userId,
        userLogin: userLogin,
        createdAt: new Date().toISOString(),
      };
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
      const newLikeStatusForPost = new LikesModel(
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
