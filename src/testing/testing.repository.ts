import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogsModel,
  CommentsModel,
  PostsModel,
  UsersModel,
} from '../helper/allTypes';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel('blogs') protected blogsCollection: Model<BlogsModel>,
    @InjectModel('posts') protected postsCollection: Model<PostsModel>,
    @InjectModel('users') protected usersCollection: Model<UsersModel>,
    @InjectModel('comments') protected commentsCollection: Model<CommentsModel>,
  ) {}
  async deleteAllCollection() {
    await this.blogsCollection.deleteMany({});
    await this.postsCollection.deleteMany({});
    await this.usersCollection.deleteMany({});
    await this.commentsCollection.deleteMany({});
    // await registrationUsersCollection.deleteMany({});
    // await refreshTokenDataCollection.deleteMany({});
    // await countAttemptCollection.deleteMany({});
    // await likeInfoCollection.deleteMany({});
  }
}
