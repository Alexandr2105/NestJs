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

  async getUserGameForTest(gameId: string) {
    return this.quizGameCollection.findOneBy({ gameId: gameId });
  }

  async getUnfinishedGame(status: any, userId: string) {
    return this.quizGameCollection.findOneBy([
      { status: Not(status), playerId1: userId },
      { status: Not(status), playerId2: userId },
    ]);
  }

  getAllStaticForCurrentUserGames(userId: string) {
    return this.quizGameCollection.find({
      where: [{ playerId1: userId }, { playerId2: userId }],
      select: {
        gameId: true,
        playerId1: true,
        playerLogin1: true,
        scorePlayer1: true,
        playerId2: true,
        playerLogin2: true,
        scorePlayer2: true,
      },
    });
  }

  async save(newGame: PairQuizGameEntity) {
    await this.quizGameCollection.save(newGame);
  }
}
