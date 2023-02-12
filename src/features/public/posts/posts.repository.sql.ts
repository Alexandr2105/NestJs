import { Injectable } from '@nestjs/common';
import { IPostsRepository } from './i.posts.repository';
import { LikesModelDocument } from '../../../common/schemas/like.type.schema';
import { PostDocument } from './schema/posts.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IUsersRepository } from '../../sa/users/i.users.repository';

@Injectable()
export class PostsRepositorySql extends IPostsRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly usersRepository: IUsersRepository,
  ) {
    super();
  }

  async createLikeStatus(likeStatus: LikesModelDocument): Promise<boolean> {
    await this.dataSource.query(
      `INSERT INTO public."LikesModel"
            ("id", "userId", "login", "status", "createDate")
            VALUES ($1, $2, $3, $4, $5)`,
      [
        likeStatus.id,
        likeStatus.userId,
        likeStatus.login,
        likeStatus.status,
        likeStatus.createDate,
      ],
    );
    return true;
  }

  async deletePostId(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM public."Posts"
            WHERE "id"=$1`,
      [id],
    );
    return result[1] === 1;
  }

  async getAllInfoLike(postId: string): Promise<LikesModelDocument[]> {
    const banUsers = await this.usersRepository.getBanUsers();
    return this.dataSource.query(
      `SELECT * FROM public."LikesModel"
            WHERE "id"=$1 AND "status"=$2 AND "userId" != ANY ($3)
            ORDER BY "createDate" DESC
            LIMIT 3`,
      [
        postId,
        'Like',
        banUsers.map((a) => {
          return a.id;
        }),
      ],
    );
  }

  async getDislikeInfo(idPost: string): Promise<number | undefined> {
    const banUsers = await this.usersRepository.getBanUsers();
    const allDislikes = await this.dataSource.query(
      `SELECT * FROM public."LikesModel"
            WHERE "id"=$1 AND "status"=$2 AND "userId" != ANY ($3)`,
      [
        idPost,
        'Dislike',
        banUsers.map((a) => {
          return a.id;
        }),
      ],
    );
    if (allDislikes) {
      return allDislikes.length;
    } else {
      return 0;
    }
  }

  async getInfoStatusByPost(idPost: string, userId: string) {
    const info = await this.dataSource.query(
      `SELECT * FROM public."LikesModel"
            WHERE "id"=$1 AND "userId"=$2`,
      [idPost, userId],
    );
    return info[0];
  }

  async getLikesInfo(idPost: string): Promise<number> {
    const banUsers = await this.usersRepository.getBanUsers();
    const allLikes = await this.dataSource.query(
      `SELECT * FROM public."LikesModel"
            WHERE "id"=$1 AND "status"=$2 AND "userId" != ANY ($3)`,
      [
        idPost,
        'Like',
        banUsers.map((a) => {
          return a.id;
        }),
      ],
    );
    if (allLikes) {
      return allLikes.length;
    } else {
      return 0;
    }
  }

  async getMyStatus(
    userId: string,
    postId: string,
  ): Promise<string | undefined> {
    const commentInfo = await this.dataSource.query(
      `SELECT * FROM public."LikesModel"
            WHERE "userId"=$1 AND "id"=$2`,
      [userId, postId],
    );
    if (commentInfo[0]) {
      return commentInfo[0].status.toString();
    } else {
      return 'None';
    }
  }

  async getPostId(id: string): Promise<PostDocument | null> {
    const post = await this.dataSource.query(
      `SELECT * FROM public."Posts"
            WHERE "id"=$1`,
      [id],
    );
    return post[0];
  }

  async save(post: PostDocument) {
    await this.dataSource.query(
      `INSERT INTO public."Posts"
            ("id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "userId")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        post.id,
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
        post.createdAt,
        post.userId,
      ],
    );
  }

  async updateStatusPost(
    idPost: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    const newStatusComment = await this.dataSource.query(
      `UPDATE public."LikesModel"
            SET "status"=$1
            WHERE "id"=$2 AND "userId"=$3`,
      [status, idPost, userId],
    );
    return newStatusComment[1] === 1;
  }
}
