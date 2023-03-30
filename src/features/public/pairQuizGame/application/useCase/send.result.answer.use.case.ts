import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { PairQuizGameDto } from '../../dto/pair.quiz.game.dto';
import { IPairQuizGameRepository } from '../../i.pair.quiz.game.repository';
import { ForbiddenException } from '@nestjs/common';
import { GetCurrentUserStaticCommand } from './get.current.user.static.use.case';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StatisticGamesDocument } from '../../schema/statistic.games.schema';

export class SendResultAnswerCommand {
  constructor(public userId: string, public body: PairQuizGameDto) {}
}

@CommandHandler(SendResultAnswerCommand)
export class SendResultAnswerUseCase {
  constructor(
    @InjectModel('statisticGames')
    private readonly gameStatistic: Model<StatisticGamesDocument>,
    private readonly gamesRepository: IPairQuizGameRepository,
    private readonly commandBus: CommandBus,
  ) {}

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
      if (gameInfo.playerCount1 === 5 && gameInfo.playerCount2 < 5) {
        gameInfo.timerId = +(await this.finishGame(command.userId));
      }
      if (gameInfo.playerCount1 === 5 && gameInfo.playerCount2 === 5) {
        clearTimeout(gameInfo.timerId);
        const result = gameInfo.answersPlayer2.filter(
          (a) => a.answerStatus === 'Correct',
        );
        if (result.length > 0) {
          gameInfo.scorePlayer2++;
        }
        gameInfo.status = 'Finished';
        gameInfo.finishGameDate = new Date().toISOString();
        await this.gamesRepository.save(gameInfo);
        await this.saveStatistic(gameInfo);
        return gameInfo.answersPlayer1[gameInfo.playerCount1 - 1];
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
      if (gameInfo.playerCount2 === 5 && gameInfo.playerCount1 < 5) {
        gameInfo.timerId = +(await this.finishGame(command.userId));
      }
      if (gameInfo.playerCount2 === 5 && gameInfo.playerCount1 === 5) {
        clearTimeout(gameInfo.timerId);
        const result = gameInfo.answersPlayer1.filter(
          (a) => a.answerStatus === 'Correct',
        );
        if (result.length > 0) {
          gameInfo.scorePlayer1++;
        }
        gameInfo.status = 'Finished';
        gameInfo.finishGameDate = new Date().toISOString();
        await this.gamesRepository.save(gameInfo);
        await this.saveStatistic(gameInfo);
        return gameInfo.answersPlayer2[gameInfo.playerCount2 - 1];
      }
      await this.gamesRepository.save(gameInfo);
      return gameInfo.answersPlayer2[gameInfo.playerCount2 - 1];
    }
  }

  private async saveStatistic(gameInfo: any) {
    const userStat1 = await this.commandBus.execute(
      new GetCurrentUserStaticCommand(gameInfo.playerId1),
    );
    const info1 = await this.gamesRepository.getStatisticById(
      gameInfo.playerId1,
    );
    if (info1) {
      info1.sumScore = userStat1.sumScore;
      info1.avgScores = userStat1.avgScores;
      info1.gamesCount = userStat1.gamesCount;
      info1.winsCount = userStat1.winsCount;
      info1.lossesCount = userStat1.lossesCount;
      info1.drawsCount = userStat1.drawsCount;
      info1.userId = gameInfo.playerId1;
      info1.login = gameInfo.playerLogin1;
      await this.gamesRepository.saveStatistic(info1);
    } else {
      const newStat = new this.gameStatistic({
        userId: gameInfo.playerId1,
        login: gameInfo.playerLogin1,
        ...userStat1,
      });
      await this.gamesRepository.saveStatistic(newStat);
    }
    const userStat2 = await this.commandBus.execute(
      new GetCurrentUserStaticCommand(gameInfo.playerId2),
    );
    const info2 = await this.gamesRepository.getStatisticById(
      gameInfo.playerId2,
    );
    if (info2) {
      info2.sumScore = userStat2.sumScore;
      info2.avgScores = userStat2.avgScores;
      info2.gamesCount = userStat2.gamesCount;
      info2.winsCount = userStat2.winsCount;
      info2.lossesCount = userStat2.lossesCount;
      info2.drawsCount = userStat2.drawsCount;
      info2.userId = gameInfo.playerId2;
      info2.login = gameInfo.playerLogin2;
      await this.gamesRepository.saveStatistic(info2);
    } else {
      const newStat = new this.gameStatistic({
        userId: gameInfo.playerId2,
        login: gameInfo.playerLogin2,
        ...userStat2,
      });
      await this.gamesRepository.saveStatistic(newStat);
    }
  }

  private async finishGame(userId: string) {
    return setTimeout(async () => {
      const gameInfo = await this.gamesRepository.getUnfinishedGame(
        'Finished',
        userId,
      );
      for (let a = gameInfo.playerCount2; a < 5; a++) {
        gameInfo.answersPlayer2.push({
          questionId: gameInfo.questions[gameInfo.playerCount2].id,
          answerStatus: 'Incorrect',
          addedAt: new Date().toISOString(),
        });
      }
      const result = gameInfo.answersPlayer1.filter(
        (a) => a.answerStatus === 'Correct',
      );
      if (result.length > 0) {
        gameInfo.scorePlayer1++;
      }
      gameInfo.status = 'Finished';
      gameInfo.finishGameDate = new Date().toISOString();
      await this.gamesRepository.save(gameInfo);
      await this.saveStatistic(gameInfo);
    }, 10000);
  }
}
