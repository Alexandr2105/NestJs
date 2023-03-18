import { CommandHandler } from '@nestjs/cqrs';
import { IPairQuizGameRepository } from '../../i.pair.quiz.game.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class GetGameByIdCommand {
  constructor(public uerId: string, public gameId: string) {}
}

@CommandHandler(GetGameByIdCommand)
export class GetGameByIdUseCase {
  constructor(private readonly gamesRepository: IPairQuizGameRepository) {}

  async execute(command: GetGameByIdCommand) {
    const game = await this.gamesRepository.getGameById(command.gameId);
    if (!game) throw new NotFoundException();
    if (game.playerId1 != command.uerId && game.playerId2 != command.uerId)
      throw new ForbiddenException();
    return {
      id: game.gameId,
      firstPlayerProgress: {
        answers: game.answersPlayer1,
        player: {
          id: game.playerId1,
          login: game.playerLogin1,
        },
        score: game.scorePlayer1,
      },
      secondPlayerProgress:
        game.playerId2 === null
          ? null
          : {
              answers: game.answersPlayer2,
              player: {
                id: game.playerId2,
                login: game.playerLogin2,
              },
              score: game.scorePlayer2,
            },
      questions: game.questions.length === 0 ? null : game.questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
