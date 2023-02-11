import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshTokenDocument } from '../../../common/schemas/refresh.token.data.schema';
import { DeviceInfoDto } from './dto/device.info.dto';
import { ISecurityDevicesRepository } from './i.security.devices.repository';
import {
  CountAttempt,
  CountAttemptDocument,
} from '../../../common/schemas/count.attempt.schema';

@Injectable()
export class SecurityDevicesRepositoryMongo extends ISecurityDevicesRepository {
  constructor(
    @InjectModel('refreshTokenData')
    private readonly refreshTokenDataCollection: Model<RefreshTokenDocument>,
    @InjectModel('countAttempts')
    protected countAttemptCollection: Model<CountAttemptDocument>,
  ) {
    super();
  }

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

  async getIpDevice(ip: string) {
    return this.countAttemptCollection.findOne({
      ip: ip,
    });
  }

  async createCountAttempt(countAttempt: CountAttempt) {
    await this.countAttemptCollection.create({
      ip: countAttempt.ip,
      iat: countAttempt.iat,
      method: countAttempt.method,
      originalUrl: countAttempt.originalUrl,
      countAttempt: countAttempt.countAttempt,
    });
  }

  async updateCountAttemptMany(
    countAttempt: number,
    iat: number,
    method: string,
    originalUrl: string,
    dataIpDevice: string,
  ) {
    await this.countAttemptCollection.updateMany(
      { ip: dataIpDevice },
      {
        $set: {
          countAttempt: countAttempt,
          iat: iat,
          method: method,
          originalUrl: originalUrl,
        },
      },
    );
  }

  async updateCountAttempt(countAttempt: number, ip: string) {
    await this.countAttemptCollection.updateOne(
      { ip: ip },
      { $set: { countAttempt: countAttempt } },
    );
  }
}
