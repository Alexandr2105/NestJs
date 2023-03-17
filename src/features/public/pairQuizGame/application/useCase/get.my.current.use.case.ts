import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PairQuizGameDocument } from '../../schema/pair.quiz.game.schema';
import { IPairQuizGameRepository } from '../../i.pair.quiz.game.repository';
import { NotFoundException } from '@nestjs/common';

export class GetMyCurrentUseCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetMyCurrentUseCommand)
export class GetMyCurrentUseCase {
  constructor(
    private readonly gamesRepository: IPairQuizGameRepository,
    @InjectModel('infoQuizQuestionsGames')
    private readonly quizGameCollection: Model<PairQuizGameDocument>,
  ) {}

  async execute(command: GetMyCurrentUseCommand) {
    const game = await this.gamesRepository.getUnfinishedGame(
      'Finished',
      command.userId,
    );
    if (game) {
      return {
        id: game.gameId,
        firstPlayerProgress: {
          answers:
            game.answersPlayer1.length === 0 ? null : game.answersPlayer1,
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
                answers:
                  game.answersPlayer2.length === 0 ? null : game.answersPlayer2,
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
    } else {
      throw new NotFoundException();
    }
  }
}
