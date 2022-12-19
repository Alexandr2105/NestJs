import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CountAttemptModel,
  EmailConfirmationModel,
  LikesModel,
  RefreshTokenDataModel,
  UsersModel,
} from '../helper/allTypes';
import { BlogDocument } from '../blogs/schema/blogs.schema';
import { PostDocument } from '../posts/schema/posts.schema';
import { CommentDocument } from '../comments/schema/comment.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel('comments')
    protected commentsCollection: Model<CommentDocument>,
    @InjectModel('emailConfirmations')
    protected registrationUsersCollection: Model<EmailConfirmationModel>,
    @InjectModel('refreshTokenData')
    protected refreshTokenDataCollection: Model<RefreshTokenDataModel>,
    @InjectModel('countAttempts')
    protected countAttemptCollection: Model<CountAttemptModel>,
    @InjectModel('likeStatuses')
    protected likeInfoCollection: Model<LikesModel>,
    @InjectModel('users') protected usersCollection: Model<UsersModel>,
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
