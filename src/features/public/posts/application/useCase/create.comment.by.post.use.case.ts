import { CommandHandler } from '@nestjs/cqrs';
import {
  Comment,
  CommentDocument,
} from '../../../comments/schema/comment.schema';
import { PostsRepository } from '../../posts.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../../comments/comments.repostitory';

export class CreateCommentByPostCommand {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
    public userLogin: string,
  ) {}
}

@CommandHandler(CreateCommentByPostCommand)
export class CreateCommentByPostUseCase {
  constructor(
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    @InjectModel('comments')
    protected commentsCollection: Model<CommentDocument>,
  ) {}

  async execute(command: CreateCommentByPostCommand): Promise<Comment | false> {
    const post = await this.postsRepository.getPostId(command.postId);
    if (!post) return false;
    const newComment = new this.commentsCollection();
    newComment.content = command.content;
    newComment.idPost = post.id;
    newComment.userId = command.userId;
    newComment.userLogin = command.userLogin;
    newComment.id = +new Date() + '';
    newComment.createdAt = new Date().toISOString();
    await this.commentsRepository.save(newComment);
    return newComment;
  }
}
