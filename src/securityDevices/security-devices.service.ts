import { Inject, Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from './security.devices.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenDocument } from '../schemas/refresh.token.data.schema';

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

  async saveInfoAboutDevicesUser(
    iat: number,
    exp: number,
    deviceId: string,
    userId: string,
    userIp: string,
    deviceName: string,
  ) {
    const infoAboutRefreshToken = new this.refreshTokenDataCollection();
    infoAboutRefreshToken.iat = iat;
    infoAboutRefreshToken.exp = exp;
    infoAboutRefreshToken.deviceId = deviceId;
    infoAboutRefreshToken.userId = userIp;
    infoAboutRefreshToken.deviceName = deviceName;
    infoAboutRefreshToken.userId = userId;
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
