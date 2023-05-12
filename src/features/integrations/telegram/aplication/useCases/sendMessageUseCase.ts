import { CommandHandler } from '@nestjs/cqrs';
import { TelegramAdapter } from '../../../../../common/adapters/telegram.adapter';
import { TelegramUpdateMessage } from '../../../../../common/helper/allTypes';

export class SendMessageCommand {
  constructor(public payload: TelegramUpdateMessage) {}
}

@CommandHandler(SendMessageCommand)
export class SendMessageUseCase {
  constructor(private readonly telegramAdapter: TelegramAdapter) {}

  async execute(command: SendMessageCommand) {
    await this.telegramAdapter.sendMessage(
      `I know you ${command.payload.message.from.first_name}`,
      command.payload.message.from.id,
    );
    console.log(`I know you ${command.payload.message.from.first_name}`);
  }
}
