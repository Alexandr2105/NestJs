import { PostsRepository } from './posts.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CommentsRepository } from '../comments/comments.repostitory';
import { Post, PostDocument } from './schema/posts.schema';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments/schema/comment.schema';
import { LikesModelDocument } from '../schemas/like.type.schema';
import { validateOrReject } from 'class-validator';

@Injectable()
export class PostsService {
  constructor(
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(CommentsRepository)
    protected commentsRepository: CommentsRepository,
    @InjectModel('posts') protected postsCollection: Model<PostDocument>,
    @InjectModel('comments')
    protected commentsCollection: Model<CommentDocument>,
    @InjectModel('likeStatuses')
    protected likeInfoCollection: Model<LikesModelDocument>,
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
    await validateOrReject(UpdatePostDto);
    const post = await this.postsRepository.getPostId(id);
    if (!post) return false;
    post.content = body.content;
    post.title = body.title;
    post.shortDescription = body.shortDescription;
    post.blogId = body.blogId;
    await this.postsRepository.save(post);
    return true;
  }

  async createPost(post: CreatePostDto): Promise<Post | false> {
    const infoBlog: any = await this.blogsRepository.getBlogId(post.blogId);
    const newPost = new this.postsCollection(post);
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
  ): Promise<Comment | false> {
    const post = await this.postsRepository.getPostId(postId);
    if (!post) return false;
    const newComment = new this.commentsCollection();
    newComment.content = content;
    newComment.idPost = post.id;
    newComment.userId = userId;
    newComment.userLogin = userLogin;
    newComment.id = +new Date() + '';
    newComment.createdAt = new Date().toISOString();
    await this.commentsRepository.save(newComment);
    return newComment;
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
      const newLikeStatusForPost = new this.likeInfoCollection();
      newLikeStatusForPost.id = postId;
      newLikeStatusForPost.userId = userId;
      newLikeStatusForPost.login = login;
      newLikeStatusForPost.status = likeStatus;
      newLikeStatusForPost.createDate = new Date().toISOString();
      return await this.postsRepository.createLikeStatus(newLikeStatusForPost);
    }
  }
}
