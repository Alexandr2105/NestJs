import { Inject, Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from './security.devices.repository';
import { RefreshTokenDataModel } from '../helper/allTypes';

@Injectable()
export class SecurityDevicesService {
  constructor(
    @Inject(SecurityDevicesRepository)
    protected securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  createDeviceId() {
    return +new Date() + '';
  }

  async saveInfoAboutDevicesUser(
    iat: number,
    exp: number,
    deviceId: string,
    userId: string,
    userIp: string,
    deviceName: string | undefined,
  ) {
    const infoAboutRefreshToken = new RefreshTokenDataModel(
      iat,
      exp,
      deviceId,
      userIp,
      deviceName,
      userId,
    );
    await this.securityDevicesRepository.saveInfoAboutRefreshToken(
      infoAboutRefreshToken,
    );
  }

  async delOldRefreshTokenData(date: number) {
    await this.securityDevicesRepository.delOldRefreshTokenData(date);
  }

  async delAllDevicesExcludeCurrent(deviceId: string) {
    await this.securityDevicesRepository.delAllDevicesExcludeCurrent(deviceId);
  }

  async delDevice(deviceId: string): Promise<boolean> {
    return await this.securityDevicesRepository.delDevice(deviceId);
  }

  async updateInfoAboutDeviceUser(
    iat: number,
    exp: number,
    deviceId: string,
    ip: string,
    deviceName: string | undefined,
    userId: string,
  ) {
    await this.securityDevicesRepository.updateInfoAboutDeviceUser(
      iat,
      exp,
      deviceId,
      ip,
      deviceName,
      userId,
    );
  }
}
