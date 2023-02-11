import { Injectable } from '@nestjs/common';
import { ISecurityDevicesRepository } from '../i.security.devices.repository';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityDevicesRepository: ISecurityDevicesRepository,
  ) {}

  createDeviceId() {
    return +new Date() + '';
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
}
