import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogDocument } from '../blogs/schema/blogs.schema';
import { PostDocument } from '../posts/schema/posts.schema';
import { CommentDocument } from '../comments/schema/comment.schema';
import { UserDocument } from '../users/schema/user';
import { RefreshTokenDocument } from '../schemas/refresh.token.data.schema';
import { EmailConfirmationDocument } from '../schemas/email.confirmation.schema';
import { CountAttemptDocument } from '../schemas/count.attempt.schema';
import { LikesModelDocument } from '../schemas/like.type.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel('comments')
    protected commentsCollection: Model<CommentDocument>,
    @InjectModel('emailConfirmations')
    protected registrationUsersCollection: Model<EmailConfirmationDocument>,
    @InjectModel('refreshTokenData')
    protected refreshTokenDataCollection: Model<RefreshTokenDocument>,
    @InjectModel('countAttempts')
    protected countAttemptCollection: Model<CountAttemptDocument>,
    @InjectModel('likeStatuses')
    protected likeInfoCollection: Model<LikesModelDocument>,
    @InjectModel('users') protected usersCollection: Model<UserDocument>,
    @InjectModel('posts') protected postsCollection: Model<PostDocument>,
    @InjectModel('blogs') protected blogsCollection: Model<BlogDocument>,
  ) {}
  async deleteAllCollection() {
    await this.blogsCollection.deleteMany({});
    await this.postsCollection.deleteMany({});
    await this.usersCollection.deleteMany({});
    await this.commentsCollection.deleteMany({});
    await this.registrationUsersCollection.deleteMany({});
    await this.refreshTokenDataCollection.deleteMany({});
    await this.countAttemptCollection.deleteMany({});
    await this.likeInfoCollection.deleteMany({});
  }
}
