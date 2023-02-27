import { ITestingRepository } from './i.testing.repository';
import { Repository } from 'typeorm';
import { CommentEntity } from '../features/public/comments/entity/comment.entity';
import { EmailConfirmationEntity } from '../common/entity/email.confirmation.entity';
import { CountAttemptEntity } from '../common/entity/count.attempt.entity';
import { UserEntity } from '../features/sa/users/entity/user.entity';
import { PostEntity } from '../features/public/posts/entity/post.entity';
import { BlogEntity } from '../features/public/blogs/entity/blog.entity';
import { BanUsersEntity } from '../features/sa/users/entity/banUsers.entity';
import { BanUsersForBlogEntity } from '../features/public/blogs/entity/ban.users.for.blog.entity';
import { RefreshTokenDataEntity } from '../common/entity/refresh.token.data.entities';
import { LikeStatusEntity } from '../common/entity/like.status.entity';

export class TestingRepositoryTypeorm extends ITestingRepository {
  constructor(
    private readonly commentsCollection: Repository<CommentEntity>,
    private readonly registrationUsersCollection: Repository<EmailConfirmationEntity>,
    private readonly refreshTokenDataCollection: Repository<RefreshTokenDataEntity>,
    private readonly countAttemptCollection: Repository<CountAttemptEntity>,
    private readonly likeInfoCollection: Repository<LikeStatusEntity>,
    private readonly usersCollection: Repository<UserEntity>,
    private readonly postsCollection: Repository<PostEntity>,
    private readonly blogsCollection: Repository<BlogEntity>,
    private readonly banUsers: Repository<BanUsersEntity>,
    private readonly banUsersForBlogsCollection: Repository<BanUsersForBlogEntity>,
  ) {
    super();
  }

  async deleteAllCollection() {
    await this.blogsCollection.clear();
    await this.postsCollection.clear();
    await this.usersCollection.clear();
    await this.commentsCollection.clear();
    await this.registrationUsersCollection.clear();
    await this.refreshTokenDataCollection.clear();
    await this.countAttemptCollection.clear();
    await this.likeInfoCollection.clear();
    await this.banUsers.clear();
    await this.banUsersForBlogsCollection.clear();
  }
}
