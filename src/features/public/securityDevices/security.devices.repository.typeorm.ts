import { ISecurityDevicesRepository } from './i.security.devices.repository';
import { RefreshTokenDocument } from '../../../common/schemas/refresh.token.data.schema';
import { DeviceInfoDto } from './dto/device.info.dto';
import { CountAttemptDocument } from '../../../common/schemas/count.attempt.schema';

export class SecurityDevicesRepositoryTypeorm extends ISecurityDevicesRepository {
  async createCountAttempt(countAttempt: CountAttemptDocument) {}

  async delAllDevicesExcludeCurrent(deviceId: string, userId: string) {}

  async delAllDevicesUser(userId: string) {}

  async delDevice(deviceId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  async delOldRefreshTokenData(date: number) {}

  async getAllDevicesUser(userId: string): Promise<DeviceInfoDto[]> {
    return Promise.resolve([]);
  }

  async getDevice(deviceId: string) {}

  async getInfoAboutDeviceUser(
    userId: string,
    deviceId: string,
  ): Promise<RefreshTokenDocument> {
    return Promise.resolve(undefined);
  }

  async getIpDevice(ip: string) {}

  async save(infoRefreshToken: RefreshTokenDocument) {}

  async updateCountAttempt(countAttempt: number, ip: string) {}

  async updateCountAttemptMany(
    countAttempt: number,
    iat: number,
    method: string,
    originalUrl: string,
    dataIpDevice: string,
  ) {}
}
