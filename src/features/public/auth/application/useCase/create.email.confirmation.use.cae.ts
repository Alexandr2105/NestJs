import { CreateUserDto } from '../../../../sa/users/dto/user.dto';
import { EmailConfirmationDocument } from '../../../../../common/schemas/email.confirmation.schema';
import { add } from 'date-fns';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid4 } from 'uuid';
import { EmailManager } from '../../../../../common/manager/email-manager';
import { IAuthRepository } from '../../i.auth.repository';

export class CreateEmailConfirmationCommand {
  constructor(public id: string, public body: CreateUserDto) {}
}

@CommandHandler(CreateEmailConfirmationCommand)
export class CreateEmailConfirmationUseCae {
  constructor(
    private readonly emailManager: EmailManager,
    private readonly authRepository: IAuthRepository,
    @InjectModel('emailConfirmations')
    private readonly registrationUsersCollection: Model<EmailConfirmationDocument>,
  ) {}

  async execute(command: CreateEmailConfirmationCommand) {
    const emailConfirmation: EmailConfirmationDocument =
      new this.registrationUsersCollection();
    emailConfirmation.userId = command.id;
    emailConfirmation.confirmationCode = uuid4();
    emailConfirmation.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    });
    emailConfirmation.isConfirmed = false;
    await this.authRepository.save(emailConfirmation);
    try {
      await this.emailManager.sendEmailAndConfirm(
        command.body,
        emailConfirmation.confirmationCode,
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
