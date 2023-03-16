import { PairQuizGameDocument } from './schema/pair.quiz.game.schema';
import { PairQuizGameEntity } from './entity/pair.quiz.game.entity';

export abstract class IPairQuizGameRepository {
  abstract getGameByStatus(status: string);
  abstract save(newGame: PairQuizGameDocument | PairQuizGameEntity);
  abstract getGameByStatusAndUserId(status: string, userId: string);
  abstract getUnfinishedGame(status: string, userId: string);
  abstract getGameById(gameId: string);
}
