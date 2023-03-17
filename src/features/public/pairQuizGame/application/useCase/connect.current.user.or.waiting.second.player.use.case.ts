import { CommandHandler } from '@nestjs/cqrs';
import { IPairQuizGameRepository } from '../../i.pair.quiz.game.repository';
import { Model } from 'mongoose';
import { PairQuizGameDocument } from '../../schema/pair.quiz.game.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IQuizQuestionsRepositorySa } from '../../../../sa/quizQuestions/i.quiz.questions.repository.sa';
import { ForbiddenException } from '@nestjs/common';

export class ConnectCurrentUserOrWaitingSecondPlayerCommand {
  constructor(public userId: string, public login: string) {}
}

@CommandHandler(ConnectCurrentUserOrWaitingSecondPlayerCommand)
export class ConnectCurrentUserOrWaitingSecondPlayerUseCase {
  constructor(
    private readonly gamesRepository: IPairQuizGameRepository,
    private readonly quizGameRepository: IQuizQuestionsRepositorySa,
    @InjectModel('infoQuizQuestionsGames')
    private readonly quizGameCollection: Model<PairQuizGameDocument>,
  ) {}

  async execute(command: ConnectCurrentUserOrWaitingSecondPlayerCommand) {
    const checkUser = await this.gamesRepository.getUnfinishedGame(
      'Finished',
      command.userId,
    );
    if (checkUser) throw new ForbiddenException();
    const game = await this.gamesRepository.getGameByStatus(
      'PendingSecondPlayer',
    );
    if (!game) {
      const newGame = new this.quizGameCollection(command);
      newGame.gameId = +new Date() + '';
      newGame.status = 'PendingSecondPlayer';
      newGame.scorePlayer1 = 0;
      newGame.pairCreatedDate = new Date().toISOString();
      newGame.playerId1 = command.userId;
      newGame.playerLogin1 = command.login;
      await this.gamesRepository.save(newGame);
      return {
        id: newGame.gameId,
        firstPlayerProgress: {
          answers: null,
          player: {
            id: newGame.playerId1,
            login: newGame.playerLogin1,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: 'PendingSecondPlayer',
        pairCreatedDate: newGame.pairCreatedDate,
        startGameDate: null,
        finishGameDate: null,
      };
    } else {
      const randomQuestionsAndAnswers =
        await this.quizGameRepository.getRandomQuestions(5);
      game.playerId2 = command.userId;
      game.playerLogin2 = command.login;
      game.status = 'Active';
      game.startGameDate = new Date().toISOString();
      game.questions = randomQuestionsAndAnswers.randomQuestions;
      game.allAnswers = randomQuestionsAndAnswers.correctAnswers;
      game.scorePlayer2 = 0;
      await this.gamesRepository.save(game);
      return {
        id: game.gameId,
        firstPlayerProgress: {
          answers: null,
          player: {
            id: game.playerId1,
            login: game.playerLogin1,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: null,
          player: {
            id: game.playerId2,
            login: game.playerLogin2,
          },
          score: 0,
        },
        questions: game.questions,
        status: game.status,
        pairCreatedDate: game.pairCreatedDate,
        startGameDate: game.startGameDate,
        finishGameDate: game.finishGameDate,
      };
    }
  }
}
