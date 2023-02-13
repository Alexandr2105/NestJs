import { ICommentsRepository } from './i.comments.repository';
import { CommentDocument } from './schema/comment.schema';
import { LikesModel } from '../../../common/schemas/like.type.schema';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IUsersRepository } from '../../sa/users/i.users.repository';

@Injectable()
export class CommentsRepositorySql extends ICommentsRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly usersRepository: IUsersRepository,
  ) {
    super();
  }

  async deleteCommentById(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM public."Comments"
            WHERE "id"=$1`,
      [id],
    );
    return result[1] === 1;
  }

  async getCommentById(id: string): Promise<CommentDocument | null> {
    const comment = await this.dataSource.query(
      `SELECT * FROM public."Comments"
            WHERE "id"=$1`,
      [id],
    );
    return comment[0];
  }

  async getDislikeInfo(idComment: string): Promise<number | undefined> {
    const banUsers = await this.usersRepository.getBanUsers();
    const allDislikes = await this.dataSource.query(
      `SELECT * FROM public."LikesModel"
            WHERE "id"=$1 AND "status"=$2 AND "userId" != ANY ($3)`,
      [
        idComment,
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

  async getInfoStatusByComment(idComment: string, userId: string) {
    const info = this.dataSource.query(
      `SELECT * FROM public."LikesModel"
            WHERE "id"=$1 AND "userId"=$2`,
      [idComment, userId],
    );
    return info[0];
  }

  async getLikesInfo(idComment: string): Promise<number> {
    const banUsers = await this.usersRepository.getBanUsers();
    const allLikes = await this.dataSource.query(
      `SELECT * FROM public."LikesModel"
            WHERE "id"=$1 AND "status"=$2 AND "userId" != ANY ($3)`,
      [
        idComment,
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
    commentId: string,
  ): Promise<string | undefined> {
    const commentInfo = await this.dataSource.query(
      `SELECT * FROM public."LikesModel"
            WHERE "userId"=$1 AND "id"=$2`,
      [userId, commentId],
    );
    if (commentInfo[0]) {
      return commentInfo[0].status.toString();
    } else {
      return 'None';
    }
  }

  async save(comment: CommentDocument) {
    if (!(await this.getCommentById(comment.id))) {
      await this.dataSource.query(
        `INSERT INTO public."Comments"
            ("id", "idPost", "content", "userId", "userLogin", "createdAt")
            VALUES($1,$2,$3,$4,$5,$6)`,
        [
          comment.id,
          comment.idPost,
          comment.content,
          comment.userId,
          comment.userLogin,
          comment.createdAt,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public."Comments"
            SET "content"=$1
            WHERE "id"=$2`,
        [comment.content, comment.id],
      );
    }
  }

  async setLikeStatus(likeInfo: LikesModel): Promise<boolean> {
    const info = await this.dataSource.query(
      `INSERT INTO public."LikesModel"
            ("id","userId","login","status","createDate")
            VALUES ($1,$2,$3,$4,$5)`,
      [
        likeInfo.id,
        likeInfo.userId,
        likeInfo.login,
        likeInfo.status,
        likeInfo.createDate,
      ],
    );
    return !!info;
  }

  async updateStatusComment(
    idComment: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    const newStatusComment = await this.dataSource.query(
      `UPDATE public."LikesModel"
            SET "status"=$1
            WHERE "id"=$2,"userId"=$3`,
      [status, idComment, userId],
    );
    return newStatusComment[1] === 1;
  }
}
