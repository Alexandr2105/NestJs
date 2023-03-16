import { CommandHandler } from '@nestjs/cqrs';
import { IPairQuizGameRepository } from '../../i.pair.quiz.game.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class GetGameByIdCommand {
  constructor(public uerId: string) {}
}

@CommandHandler(GetGameByIdCommand)
export class GetGameByIdUseCase {
  constructor(private readonly gamesRepository: IPairQuizGameRepository) {}

  async execute(command: GetGameByIdCommand) {
    const game = await this.gamesRepository.getGameById(command.uerId);
    if (!game) throw new NotFoundException();
    if (game.playerId1 != command.uerId || game.playerId2 != command.uerId)
      throw new ForbiddenException();
    return {
      id: game.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: game.answersPlayer1.questionId,
            answerStatus: game.answersPlayer1.answerStatus,
            addedAt: game.answersPlayer1.addedAt,
          },
        ],
        player: {
          id: game.playerId1,
          login: game.playerLogin1,
        },
        score: game.scorePlayer1,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: game.answersPlayer2.questionId,
            answerStatus: game.answersPlayer2.answerStatus,
            addedAt: game.answersPlayer2.addedAt,
          },
        ],
        player: {
          id: game.playerId2,
          login: game.playerLogin2,
        },
        score: game.scorePlayer2,
      },
      questions: [
        {
          id: game.questions.id,
          body: game.questions.body,
        },
      ],
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
