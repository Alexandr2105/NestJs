import { PairQuizGameDocument } from './schema/pair.quiz.game.schema';
import { PairQuizGameEntity } from './entity/pair.quiz.game.entity';
import { StatisticGamesDocument } from './schema/statistic.games.schema';
import { StatisticGamesEntity } from './entity/statistic.games.entity';

export abstract class IPairQuizGameRepository {
  abstract getGameByStatus(status: string);
  abstract save(newGame: PairQuizGameDocument | PairQuizGameEntity);
  abstract getUserGameForTest(gameId: string);
  abstract getUnfinishedGame(status: string, userId: string);
  abstract getGameById(gameId: string);
  abstract getAllStaticForCurrentUserGames(userId: string, status: string);
  abstract saveStatistic(info: StatisticGamesDocument | StatisticGamesEntity);
  abstract getStatisticById(id: string);
}
