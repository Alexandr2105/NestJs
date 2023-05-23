import { CommandHandler } from '@nestjs/cqrs';
import { IUsersRepository } from '../../../../sa/users/i.users.repository';
import { UserDocument } from '../../../../sa/users/schema/user';
import { TelegramAdapter } from '../../../../../common/adapters/telegram.adapter';

export class SendMessageForUserAboutNewPostCommand {
  constructor(public subscribes: string[], public blogName: string) {}
}

@CommandHandler(SendMessageForUserAboutNewPostCommand)
export class SendMessageForUserAboutNewPostUseCase {
  constructor(
    private readonly user: IUsersRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  async execute(command: SendMessageForUserAboutNewPostCommand) {
    for (const userId of command.subscribes) {
      const user: UserDocument = await this.user.getUserByIdAll(userId);
      if (user.telegramId !== null) {
        await this.telegramAdapter.sendMessage(
          `New post published for blog "${command.blogName}"`,
          +user.telegramId,
        );
      }
    }
  }
}
