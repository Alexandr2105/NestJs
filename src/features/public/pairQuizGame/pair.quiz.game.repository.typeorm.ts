import { IPairQuizGameRepository } from './i.pair.quiz.game.repository';
import { PairQuizGameEntity } from './entity/pair.quiz.game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

export class PairQuizGameRepositoryTypeorm extends IPairQuizGameRepository {
  constructor(
    @InjectRepository(PairQuizGameEntity)
    private readonly quizGameCollection: Repository<PairQuizGameEntity>,
  ) {
    super();
  }

  async getGameById(gameId: string) {
    return this.quizGameCollection.findOneBy({ gameId: gameId });
  }

  async getGameByStatus(status: any) {
    return this.quizGameCollection.findOneBy({ status: status });
  }

  async getUnfinishedUserGameForTest(gameId: string) {
    return this.quizGameCollection.findOneBy({ gameId: gameId });
  }

  async getUnfinishedGame(status: any, userId: string) {
    return this.quizGameCollection.findOneBy([
      { status: Not(status), playerId1: userId },
      { status: Not(status), playerId2: userId },
    ]);
  }

  async save(newGame: PairQuizGameEntity) {
    await this.quizGameCollection.save(newGame);
  }
}
