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
      return game;
    } else {
      throw new NotFoundException();
    }
  }
}
