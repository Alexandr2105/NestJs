import { Inject, Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from './security.devices.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshTokenData,
  RefreshTokenDocument,
} from '../schemas/refresh.token.data.schema';

@Injectable()
export class SecurityDevicesService {
  constructor(
    @Inject(SecurityDevicesRepository)
    protected securityDevicesRepository: SecurityDevicesRepository,
    @InjectModel('refreshTokenData')
    protected refreshTokenDataCollection: Model<RefreshTokenDocument>,
  ) {}

  createDeviceId() {
    return +new Date() + '';
  }

  async saveInfoAboutDevicesUser(infoDevice: RefreshTokenData) {
    const infoAboutRefreshToken = new this.refreshTokenDataCollection(
      infoDevice,
    );
    await this.securityDevicesRepository.save(infoAboutRefreshToken);
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

  async updateInfoAboutDeviceUser(infoDevice: RefreshTokenData) {
    const deviceInfo =
      await this.securityDevicesRepository.getInfoAboutDeviceUser(
        infoDevice.userId,
        infoDevice.deviceId,
      );
    deviceInfo.iat = infoDevice.iat;
    deviceInfo.exp = infoDevice.exp;
    deviceInfo.ip = infoDevice.ip;
    deviceInfo.deviceName = infoDevice.deviceName;
    await this.securityDevicesRepository.save(deviceInfo);
    return true;
  }
}
