import { CommandHandler } from '@nestjs/cqrs';
import { TelegramUpdateMessage } from '../../../../../common/helper/allTypes';
import { IUsersRepository } from '../../../../sa/users/i.users.repository';
import { UserDocument } from '../../../../sa/users/schema/user';
import { TelegramAdapter } from '../../../../../common/adapters/telegram.adapter';

export class AddTelegramIdForUserCommand {
  constructor(public payload: TelegramUpdateMessage) {}
}

@CommandHandler(AddTelegramIdForUserCommand)
export class AddTelegramIdForUserUseCase {
  constructor(
    private readonly user: IUsersRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  async execute(command: AddTelegramIdForUserCommand) {
    const id = command.payload.message.text.split('=')[1];
    const user: UserDocument = await this.user.getUserByIdAll(id);
    user.telegramId = command.payload.message.from.id.toString();
    await this.user.save(user);
    // TODO:await this.telegramAdapter.sendMessage(
    //   'Вы подписались на обновления',
    //   command.payload.message.from.id,
    // );
  }
}
