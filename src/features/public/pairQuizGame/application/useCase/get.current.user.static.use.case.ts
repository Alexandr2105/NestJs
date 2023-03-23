import { CommandHandler } from '@nestjs/cqrs';
import { IPairQuizGameRepository } from '../../i.pair.quiz.game.repository';

export class GetCurrentUserStaticCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetCurrentUserStaticCommand)
export class GetCurrentUserStaticUseCase {
  constructor(
    private readonly pairQuizGamesRepository: IPairQuizGameRepository,
  ) {}

  async execute(command: GetCurrentUserStaticCommand) {
    const allInfo =
      await this.pairQuizGamesRepository.getAllStaticForCurrentUserGames(
        command.userId,
      );
    const gamesCount = allInfo?.length;
    let sumScore = 0;
    let avgScores = 0;
    let winsCount = 0;
    let lossesCount = 0;
    let drawsCount = 0;
    if (gamesCount === 0) {
      return {
        sumScore,
        avgScores,
        gamesCount,
        winsCount,
        lossesCount,
        drawsCount,
      };
    } else {
      for (const a of allInfo) {
        if (a.playerId1 === command.userId) {
          sumScore += a.scorePlayer1;
          if (a.scorePlayer1 > a.scorePlayer2) {
            winsCount++;
          } else if (a.scorePlayer1 < a.scorePlayer2) {
            lossesCount++;
          } else {
            drawsCount++;
          }
        } else {
          sumScore += a.scorePlayer2;
          if (a.scorePlayer2 > a.scorePlayer1) {
            winsCount++;
          } else if (a.scorePlayer2 < a.scorePlayer1) {
            lossesCount++;
          } else {
            drawsCount++;
          }
        }
      }
      avgScores = Math.round((sumScore / gamesCount) * 100) / 100;
      return {
        sumScore,
        avgScores,
        gamesCount,
        winsCount,
        lossesCount,
        drawsCount,
      };
    }
  }
}
