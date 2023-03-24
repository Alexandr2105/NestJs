import { IPairQuizGameRepository } from './i.pair.quiz.game.repository';
import { PairQuizGameDocument } from './schema/pair.quiz.game.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StatisticGamesDocument } from './schema/statistic.games.schema';

export class PairQuizGameRepositoryMongo extends IPairQuizGameRepository {
  constructor(
    @InjectModel('infoQuizQuestionsGames')
    private readonly quizGameCollection: Model<PairQuizGameDocument>,
    @InjectModel('statisticGames')
    private readonly gameStatistic: Model<StatisticGamesDocument>,
  ) {
    super();
  }
  async getGameById(gameId: string) {
    return this.quizGameCollection.findOne({ gameId: gameId });
  }

  async getGameByStatus(status: string) {
    return this.quizGameCollection.findOne({ status: status });
  }

  async getUserGameForTest(gameId: string) {
    return this.quizGameCollection.findOne({ gameId: gameId });
  }

  async getUnfinishedGame(status: string, userId: string) {
    return this.quizGameCollection.findOne({
      status: { $ne: status },
      $or: [{ playerId2: userId }, { playerId1: userId }],
    });
  }

  async getAllStaticForCurrentUserGames(userId: string, status: string) {
    return this.quizGameCollection
      .find({
        status: status,
        $or: [{ playerId1: userId }, { playerId2: userId }],
      })
      .select(
        'gameId playerId1 playerLogin1 scorePlayer1 playerId2 playerLogin2 scorePlayer2',
      );
  }

  async getStatisticById(id: string) {
    return this.gameStatistic.findOne({ userId: id });
  }

  async save(newGame: PairQuizGameDocument) {
    await newGame.save();
  }

  async saveStatistic(info: StatisticGamesDocument) {
    await info.save();
  }
}
