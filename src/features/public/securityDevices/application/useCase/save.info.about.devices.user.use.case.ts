import {
  RefreshTokenData,
  RefreshTokenDocument,
} from '../../../../../common/schemas/refresh.token.data.schema';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityDevicesRepository } from '../../security.devices.repository';

export class SaveInfoAboutDevicesUserCommand {
  constructor(public infoDevice: RefreshTokenData) {}
}

@CommandHandler(SaveInfoAboutDevicesUserCommand)
export class SaveInfoAboutDevicesUserUseCase {
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    @InjectModel('refreshTokenData')
    protected refreshTokenDataCollection: Model<RefreshTokenDocument>,
  ) {}

  async execute(command: SaveInfoAboutDevicesUserCommand) {
    const infoAboutRefreshToken = new this.refreshTokenDataCollection(
      command.infoDevice,
    );
    await this.securityDevicesRepository.save(infoAboutRefreshToken);
  }
}
