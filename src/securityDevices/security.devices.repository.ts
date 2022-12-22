import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshTokenDocument } from '../schemas/refresh.token.data.schema';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel('refreshTokenData')
    protected refreshTokenDataCollection: Model<RefreshTokenDocument>,
  ) {}

  async saveInfoAboutRefreshToken(infoRefreshToken: RefreshTokenDocument) {
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

  async getAllDevicesUser(userId: string) {
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

  async updateInfoAboutDeviceUser(
    iat: number,
    exp: number,
    deviceId: string,
    ip: string,
    deviceName: string | undefined,
    userId: string,
  ) {
    await this.refreshTokenDataCollection.updateOne(
      { $and: [{ userId: userId }, { deviceId: deviceId }] },
      {
        $set: {
          iat: iat,
          exp: exp,
          ip: ip,
          deviceName: deviceName,
        },
      },
    );
  }
}
