import { CommandHandler } from '@nestjs/cqrs';
import { EmailResending } from '../../dto/auth.dto';
import { v4 as uuid4 } from 'uuid';
import { UsersRepository } from '../../../../sa/users/users.repository';

export class GetNewConfirmationCodeCommand {
  constructor(public body: EmailResending) {}
}

@CommandHandler(GetNewConfirmationCodeCommand)
export class GetNewConfirmationCodeUseCase {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(command: GetNewConfirmationCodeCommand) {
    const newCode = uuid4();
    const updateCode = await this.usersRepository.setConfirm(
      command.body,
      newCode,
    );
    if (updateCode) {
      return newCode;
    }
  }
}
