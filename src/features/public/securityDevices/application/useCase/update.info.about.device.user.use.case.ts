import { RefreshTokenData } from '../../../../../common/schemas/refresh.token.data.schema';
import { CommandHandler } from '@nestjs/cqrs';
import { ISecurityDevicesRepository } from '../../i.security.devices.repository';

export class UpdateInfoAboutDevicesUserCommand {
  constructor(public infoDevice: RefreshTokenData) {}
}

@CommandHandler(UpdateInfoAboutDevicesUserCommand)
export class UpdateInfoAboutDeviceUserUseCase {
  constructor(
    protected securityDevicesRepository: ISecurityDevicesRepository,
  ) {}

  async execute(command: UpdateInfoAboutDevicesUserCommand) {
    const deviceInfo =
      await this.securityDevicesRepository.getInfoAboutDeviceUser(
        command.infoDevice.userId,
        command.infoDevice.deviceId,
      );
    deviceInfo.iat = command.infoDevice.iat;
    deviceInfo.exp = command.infoDevice.exp;
    deviceInfo.ip = command.infoDevice.ip;
    deviceInfo.deviceName = command.infoDevice.deviceName;
    await this.securityDevicesRepository.save(deviceInfo);
    return true;
  }
}
