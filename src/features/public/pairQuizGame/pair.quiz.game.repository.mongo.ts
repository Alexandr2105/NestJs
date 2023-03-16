import { IPairQuizGameRepository } from './i.pair.quiz.game.repository';
import { PairQuizGameDocument } from './schema/pair.quiz.game.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class PairQuizGameRepositoryMongo extends IPairQuizGameRepository {
  constructor(
    @InjectModel('infoQuizQuestionsGames')
    private readonly quizGameCollection: Model<PairQuizGameDocument>,
  ) {
    super();
  }
  async getGameById(gameId: string) {
    return this.quizGameCollection.findOne({ gameId: gameId });
  }

  async getGameByStatus(status: string) {
    return this.quizGameCollection.findOne({ status: status });
  }

  async getGameByStatusAndUserId(status: string, userId: string) {
    return this.quizGameCollection.findOne({
      status: status,
      $or: [{ playerId2: userId }, { playerId1: userId }],
    });
  }

  async getUnfinishedGame(status: string, userId: string) {
    return this.quizGameCollection.findOne({
      status: status,
      $or: [{ playerId2: userId }, { playerId1: userId }],
    });
  }

  async save(newGame: PairQuizGameDocument) {
    await newGame.save();
  }
}
