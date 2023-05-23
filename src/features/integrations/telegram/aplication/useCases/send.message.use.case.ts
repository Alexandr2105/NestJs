import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { TelegramAdapter } from '../../../../../common/adapters/telegram.adapter';
import { TelegramUpdateMessage } from '../../../../../common/helper/allTypes';
import { AddTelegramIdForUserCommand } from './add.telegram.id.for.user.use.case';

export class SendMessageCommand {
  constructor(public payload: TelegramUpdateMessage) {}
}

@CommandHandler(SendMessageCommand)
export class SendMessageUseCase {
  constructor(
    private readonly telegramAdapter: TelegramAdapter,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: SendMessageCommand) {
    if (command.payload.message.text.includes('/start code')) {
      await this.commandBus.execute(
        new AddTelegramIdForUserCommand(command.payload),
      );
    } else {
      await this.telegramAdapter.sendMessage(
        `I know you ${command.payload.message.from.first_name}`,
        command.payload.message.from.id,
      );
    }
  }
}
