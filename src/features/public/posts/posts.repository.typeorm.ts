import { IPostsRepository } from './i.posts.repository';
import { PostDocument } from './schema/posts.schema';
import { LikesModelDocument } from '../../../common/schemas/like.type.schema';
import { IUsersRepository } from '../../sa/users/i.users.repository';
import { Not, Repository } from 'typeorm';
import { PostEntity } from './entity/post.entity';
import { LikeStatusEntity } from '../../../common/entity/like.status.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsRepositoryTypeorm extends IPostsRepository {
  constructor(
    private readonly usersRepository: IUsersRepository,
    @InjectRepository(PostEntity)
    private readonly postsCollection: Repository<PostEntity>,
    @InjectRepository(LikeStatusEntity)
    private readonly likeInfoCollection: Repository<LikeStatusEntity>,
  ) {
    super();
  }

  async createLikeStatus(likeStatus: LikesModelDocument): Promise<boolean> {
    await this.likeInfoCollection.save(likeStatus);
    return true;
  }

  async deletePostId(id: string): Promise<boolean> {
    const result = await this.postsCollection.delete({ id: id });
    return result.affected === 1;
  }

  async getAllInfoLike(postId: string): Promise<LikeStatusEntity[]> {
    const banUsers = await this.usersRepository.getBanUsers();
    return this.likeInfoCollection.find({
      where: {
        id: postId,
        status: 'Like',
        userId: Not(
          banUsers.map((a) => {
            return a.id;
          }),
        ),
      },
      order: {
        createDate: 'DESC',
      },
      take: 3,
    });
  }

  async getDislikeInfo(idPost: string): Promise<number | undefined> {
    const banUsers = await this.usersRepository.getBanUsers();
    const allDislikes = await this.likeInfoCollection.findBy({
      id: idPost,
      status: 'Dislike',
      userId: Not(
        banUsers.map((a) => {
          return a.id;
        }),
      ),
    });
    if (allDislikes) {
      return allDislikes.length;
    }
  }

  async getInfoStatusByPost(idPost: string, userId: string) {
    return this.likeInfoCollection.findOneBy({ id: idPost, userId: userId });
  }

  async getLikesInfo(idPost: string): Promise<number> {
    const banUsers = await this.usersRepository.getBanUsers();
    const allDislikes = await this.likeInfoCollection.findBy({
      id: idPost,
      status: 'Like',
      userId: Not(
        banUsers.map((a) => {
          return a.id;
        }),
      ),
    });
    if (allDislikes) {
      return allDislikes.length;
    }
  }

  async getMyStatus(
    userId: string,
    postId: string,
  ): Promise<string | undefined> {
    const commentInfo = await this.likeInfoCollection.findOneBy({
      userId: userId,
      id: postId,
    });
    if (commentInfo) {
      return commentInfo.status.toString();
    } else {
      return 'None';
    }
  }

  async getPostId(id: string): Promise<PostEntity | null> {
    return this.postsCollection.findOneBy({ id: id });
  }

  async save(post: PostDocument) {
    await this.postsCollection.save(post);
  }

  async updateStatusPost(
    idPost: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    const newStatusComment = await this.likeInfoCollection.update(
      {
        id: idPost,
        userId: userId,
      },
      { status: status },
    );
    return newStatusComment.affected === 1;
  }
}
