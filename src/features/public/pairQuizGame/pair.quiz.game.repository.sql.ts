import { IPairQuizGameRepository } from './i.pair.quiz.game.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PairQuizGameEntity } from './entity/pair.quiz.game.entity';

export class PairQuizGameRepositorySql extends IPairQuizGameRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async getGameById(gameId: string) {
    const game = await this.dataSource.query(
      `SELECT * FROM public."PairQuizGame"
            WHERE "gameId"=$1`,
      [gameId],
    );
    if (game[0]) {
      return game[0];
    } else {
      return false;
    }
  }

  async getGameByStatus(status: string) {
    const game = await this.dataSource.query(
      `SELECT * FROM public."PairQuizGame"
            WHERE "status"=$1`,
      [status],
    );
    if (game[0]) {
      return game[0];
    } else {
      return false;
    }
  }

  async getUserGameForTest(gameId: string) {
    const game = await this.dataSource.query(
      `SELECT * FROM public."PairQuizGame"
            WHERE "gameId"=$1`,
      [gameId],
    );
    if (game[0]) {
      return game[0];
    } else {
      return false;
    }
  }

  async getUnfinishedGame(status: string, userId: string) {
    const game = await this.dataSource.query(
      `SELECT * FROM public."PairQuizGame"
            WHERE "status"!=$1 AND ("playerId1"=$2 OR "playerId2"=$3)`,
      [status, userId, userId],
    );
    if (game[0]) {
      return game[0];
    } else {
      return false;
    }
  }

  async getAllStaticForCurrentUserGames(userId: string) {
    return this.dataSource.query(
      `SELECT "gameId","playerId1","playerLogin1","scorePlayer1","playerId2",
      "playerLogin2","scorePlayer2" FROM public."PairQuizGame"
      WHERE "playerId1"=$1 OR "playerId2"=$2`,
      [userId, userId],
    );
  }

  async save(newGame: PairQuizGameEntity) {
    if (!(await this.getGameById(newGame.gameId))) {
      await this.dataSource.query(
        `INSERT INTO public."PairQuizGame"(
            "gameId","playerId1","playerLogin1","answersPlayer1","scorePlayer1",
            "playerId2","playerLogin2","answersPlayer2","scorePlayer2","questions",
            "allAnswers","status","pairCreatedDate","startGameDate","finishGameDate",
            "playerCount1","playerCount2")
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          newGame.gameId,
          newGame.playerId1,
          newGame.playerLogin1,
          JSON.stringify(newGame.answersPlayer1),
          newGame.scorePlayer1,
          newGame.playerId2,
          newGame.playerLogin2,
          JSON.stringify(newGame.answersPlayer2),
          newGame.scorePlayer2,
          JSON.stringify(newGame.questions),
          JSON.stringify(newGame.allAnswers),
          newGame.status,
          newGame.pairCreatedDate,
          newGame.startGameDate,
          newGame.finishGameDate,
          newGame.playerCount1,
          newGame.playerCount2,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public."PairQuizGame"
            SET "playerId1"=$1,"playerLogin1"=$2,"answersPlayer1"=$3,"scorePlayer1"=$4,
            "playerId2"=$5,"playerLogin2"=$6,"answersPlayer2"=$7,"scorePlayer2"=$8,
            "questions"=$9,"allAnswers"=$10,"status"=$11,"pairCreatedDate"=$12,
            "startGameDate"=$13,"finishGameDate"=$14,"playerCount1"=$15,"playerCount2"=$16
            WHERE "gameId"=$17`,
        [
          newGame.playerId1,
          newGame.playerLogin1,
          JSON.stringify(newGame.answersPlayer1),
          newGame.scorePlayer1,
          newGame.playerId2,
          newGame.playerLogin2,
          JSON.stringify(newGame.answersPlayer2),
          newGame.scorePlayer2,
          JSON.stringify(newGame.questions),
          JSON.stringify(newGame.allAnswers),
          newGame.status,
          newGame.pairCreatedDate,
          newGame.startGameDate,
          newGame.finishGameDate,
          newGame.playerCount1,
          newGame.playerCount2,
          newGame.gameId,
        ],
      );
    }
  }
}
