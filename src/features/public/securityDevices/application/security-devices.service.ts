import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from '../security.devices.repository';

@Injectable()
export class SecurityDevicesService {
  constructor(protected securityDevicesRepository: SecurityDevicesRepository) {}

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
