import { CommandHandler } from '@nestjs/cqrs';
import { PairQuizGameDto } from '../../dto/pair.quiz.game.dto';
import { IPairQuizGameRepository } from '../../i.pair.quiz.game.repository';
import { ForbiddenException } from '@nestjs/common';

export class SendResultAnswerCommand {
  constructor(public userId: string, public body: PairQuizGameDto) {}
}

@CommandHandler(SendResultAnswerCommand)
export class SendResultAnswerUseCase {
  constructor(private readonly gamesRepository: IPairQuizGameRepository) {}

  async execute(command: SendResultAnswerCommand) {
    const gameInfo = await this.gamesRepository.getUnfinishedGame(
      'Finished',
      command.userId,
    );
    if (!gameInfo) throw new ForbiddenException();
    if (command.userId === gameInfo.playerId1) {
      if (gameInfo.playerCount1 > gameInfo.questions.length - 1)
        throw new ForbiddenException();
      const result = gameInfo.allAnswers[gameInfo.playerCount1].includes(
        command.body.answer,
      );
      if (result) {
        gameInfo.answersPlayer1.push({
          questionId: gameInfo.questions[gameInfo.playerCount1].id,
          answerStatus: 'Correct',
          addedAt: new Date().toISOString(),
        });
        gameInfo.scorePlayer1++;
      } else {
        gameInfo.answersPlayer1.push({
          questionId: gameInfo.questions[gameInfo.playerCount1].id,
          answerStatus: 'Incorrect',
          addedAt: new Date().toISOString(),
        });
      }
      gameInfo.playerCount1++;
      if (gameInfo.playerCount1 === 5 && gameInfo.playerCount2 === 5) {
        const result = gameInfo.answersPlayer2.filter(
          (a) => a.answerStatus === 'Correct',
        );
        if (result.length > 0) {
          gameInfo.scorePlayer2++;
        }
        gameInfo.status = 'Finished';
      }
      await this.gamesRepository.save(gameInfo);
      return gameInfo.answersPlayer1[gameInfo.playerCount1 - 1];
    } else {
      if (gameInfo.playerCount2 > gameInfo.questions.length - 1)
        throw new ForbiddenException();
      const result = gameInfo.allAnswers[gameInfo.playerCount2].includes(
        command.body.answer,
      );
      if (result) {
        gameInfo.answersPlayer2.push({
          questionId: gameInfo.questions[gameInfo.playerCount2].id,
          answerStatus: 'Correct',
          addedAt: new Date().toISOString(),
        });
        gameInfo.scorePlayer2++;
      } else {
        gameInfo.answersPlayer2.push({
          questionId: gameInfo.questions[gameInfo.playerCount2].id,
          answerStatus: 'Incorrect',
          addedAt: new Date().toISOString(),
        });
      }
      gameInfo.playerCount2++;
      if (gameInfo.playerCount2 === 5 && gameInfo.playerCount1 === 5) {
        const result = gameInfo.answersPlayer1.filter(
          (a) => a.answerStatus === 'Correct',
        );
        if (result.length > 0) {
          gameInfo.scorePlayer1++;
        }
        gameInfo.status = 'Finished';
      }
      await this.gamesRepository.save(gameInfo);
      return gameInfo.answersPlayer2[gameInfo.playerCount2 - 1];
    }
  }
}
