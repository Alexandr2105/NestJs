import { CommandHandler } from '@nestjs/cqrs';
import { IUsersRepository } from '../../../../sa/users/i.users.repository';
import { TelegramAdapter } from '../../../../../common/adapters/telegram.adapter';

export class SendMessageForUserAboutNewPostCommand {
  constructor(public telegramId: string, public blogName: string) {}
}

@CommandHandler(SendMessageForUserAboutNewPostCommand)
export class SendMessageForUserAboutNewPostUseCase {
  constructor(
    private readonly user: IUsersRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  async execute(command: SendMessageForUserAboutNewPostCommand) {
    await this.telegramAdapter.sendMessage(
      `New post published for blog "${command.blogName}"`,
      +command.telegramId,
    );
  }
}
