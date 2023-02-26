import { ISecurityDevicesRepository } from './i.security.devices.repository';
import { RefreshTokenDocument } from '../../../common/schemas/refresh.token.data.schema';
import { DeviceInfoDto } from './dto/device.info.dto';
import { CountAttemptDocument } from '../../../common/schemas/count.attempt.schema';

export class SecurityDevicesRepositoryTypeorm extends ISecurityDevicesRepository {
  createCountAttempt(countAttempt: CountAttemptDocument) {}

  delAllDevicesExcludeCurrent(deviceId: string, userId: string) {}

  delAllDevicesUser(userId: string) {}

  delDevice(deviceId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  delOldRefreshTokenData(date: number) {}

  getAllDevicesUser(userId: string): Promise<DeviceInfoDto[]> {
    return Promise.resolve([]);
  }

  getDevice(deviceId: string) {}

  getInfoAboutDeviceUser(
    userId: string,
    deviceId: string,
  ): Promise<RefreshTokenDocument> {
    return Promise.resolve(undefined);
  }

  getIpDevice(ip: string) {}

  save(infoRefreshToken: RefreshTokenDocument) {}

  updateCountAttempt(countAttempt: number, ip: string) {}

  updateCountAttemptMany(
    countAttempt: number,
    iat: number,
    method: string,
    originalUrl: string,
    dataIpDevice: string,
  ) {}
}
