import { IPairQuizGameRepository } from './i.pair.quiz.game.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PairQuizGameEntity } from './entity/pair.quiz.game.entity';
import { StatisticGamesEntity } from './entity/statistic.games.entity';

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

  async getAllStaticForCurrentUserGames(userId: string, status: string) {
    return this.dataSource.query(
      `SELECT "gameId","playerId1","playerLogin1","scorePlayer1","playerId2",
      "playerLogin2","scorePlayer2" FROM public."PairQuizGame"
      WHERE "status"=$1 AND ("playerId1"=$2 OR "playerId2"=$3)`,
      [status, userId, userId],
    );
  }

  async getStatisticById(id: string) {
    const stat = await this.dataSource.query(
      `SELECT * FROM public."StatisticGames"
            WHERE "userId"=$1`,
      [id],
    );
    if (stat[0]) {
      return stat[0];
    } else {
      return false;
    }
  }

  async save(newGame: PairQuizGameEntity) {
    if (!(await this.getGameById(newGame.gameId))) {
      await this.dataSource.query(
        `INSERT INTO public."PairQuizGame"(
            "gameId","playerId1","playerLogin1","answersPlayer1","scorePlayer1",
            "playerId2","playerLogin2","answersPlayer2","scorePlayer2","questions",
            "allAnswers","status","pairCreatedDate","startGameDate","finishGameDate",
            "playerCount1","playerCount2","timerId")
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
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
          newGame.timerId,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public."PairQuizGame"
            SET "playerId1"=$1,"playerLogin1"=$2,"answersPlayer1"=$3,"scorePlayer1"=$4,
            "playerId2"=$5,"playerLogin2"=$6,"answersPlayer2"=$7,"scorePlayer2"=$8,
            "questions"=$9,"allAnswers"=$10,"status"=$11,"pairCreatedDate"=$12,
            "startGameDate"=$13,"finishGameDate"=$14,"playerCount1"=$15,"playerCount2"=$16,
            "timerId"=$17
            WHERE "gameId"=$18`,
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
          newGame.timerId,
          newGame.gameId,
        ],
      );
    }
  }

  async saveStatistic(info: StatisticGamesEntity) {
    if (!(await this.getStatisticById(info.userId))) {
      await this.dataSource.query(
        `INSERT INTO public."StatisticGames"(
            "userId","login","sumScore","avgScores","gamesCount","winsCount",
            "lossesCount","drawsCount")
            VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          info.userId,
          info.login,
          info.sumScore,
          info.avgScores,
          info.gamesCount,
          info.winsCount,
          info.lossesCount,
          info.drawsCount,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public."StatisticGames"
              SET "login"=$1,"sumScore"=$2,"avgScores"=$3,"gamesCount"=$4,
              "winsCount"=$5,"lossesCount"=$6,"drawsCount"=$7
              WHERE "userId"=$8`,
        [
          info.login,
          info.sumScore,
          info.avgScores,
          info.gamesCount,
          info.winsCount,
          info.lossesCount,
          info.drawsCount,
          info.userId,
        ],
      );
    }
  }
}
