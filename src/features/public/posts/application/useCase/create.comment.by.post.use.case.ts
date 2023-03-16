import { CommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../../comments/schema/comment.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IPostsRepository } from '../../i.posts.repository';
import { ICommentsRepository } from '../../../comments/i.comments.repository';

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
    private readonly postsRepository: IPostsRepository,
    private readonly commentsRepository: ICommentsRepository,
    @InjectModel('comments')
    private readonly commentsCollection: Model<CommentDocument>,
  ) {}

  async execute(command: CreateCommentByPostCommand) {
    const post = await this.postsRepository.getPostId(command.postId);
    if (!post) return false;
    const newComment = new this.commentsCollection();
    newComment.content = command.content;
    newComment.postId = post.id;
    newComment.userId = command.userId;
    newComment.userLogin = command.userLogin;
    newComment.id = +new Date() + '';
    newComment.createdAt = new Date().toISOString();
    await this.commentsRepository.save(newComment);
    return {
      id: newComment.id,
      content: newComment.content,
      commentatorInfo: {
        userId: newComment.userId,
        userLogin: newComment.userLogin,
      },
      createdAt: newComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }
}
