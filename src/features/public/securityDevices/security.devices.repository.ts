import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshTokenDocument } from '../../../common/schemas/refresh.token.data.schema';
import { DeviceInfoDto } from './dto/device.info.dto';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel('refreshTokenData')
    protected refreshTokenDataCollection: Model<RefreshTokenDocument>,
  ) {}

  async save(infoRefreshToken: RefreshTokenDocument) {
    await infoRefreshToken.save();
  }

  async delAllDevicesExcludeCurrent(deviceId: string) {
    await this.refreshTokenDataCollection.deleteMany({
      deviceId: { $ne: deviceId },
    });
  }

  async delDevice(deviceId: string): Promise<boolean> {
    const result = await this.refreshTokenDataCollection.deleteOne({
      deviceId: deviceId,
    });
    return result.deletedCount === 1;
  }

  async delAllDevicesUser(userId: string) {
    await this.refreshTokenDataCollection.deleteMany({
      userId: userId,
    });
  }

  async getAllDevicesUser(userId: string): Promise<DeviceInfoDto[]> {
    const deviceInfo = await this.refreshTokenDataCollection.find({
      userId: userId,
    });
    return deviceInfo.map((a) => {
      return {
        ip: a.ip,
        title: a.deviceName,
        lastActiveDate: new Date(a.iat).toISOString(),
        deviceId: a.deviceId,
      };
    });
  }

  async delOldRefreshTokenData(date: number) {
    const timeInSeconds = Math.round(date / 1000);
    await this.refreshTokenDataCollection.deleteMany({
      exp: { $lt: timeInSeconds },
    });
  }

  async getInfoAboutDeviceUser(
    userId: string,
    deviceId: string,
  ): Promise<RefreshTokenDocument> {
    return this.refreshTokenDataCollection.findOne({
      $and: [{ userId: userId }, { deviceId: deviceId }],
    });
  }

  async getDevice(deviceId: string) {
    return this.refreshTokenDataCollection.findOne({
      deviceId: deviceId,
    });
  }
}
