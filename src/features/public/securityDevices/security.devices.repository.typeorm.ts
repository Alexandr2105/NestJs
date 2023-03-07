import { ISecurityDevicesRepository } from './i.security.devices.repository';
import { DeviceInfoDto } from './dto/device.info.dto';
import { LessThan, Not, Repository } from 'typeorm';
import { RefreshTokenDataEntity } from '../../../common/entity/refresh.token.data.entities';
import { CountAttemptEntity } from '../../../common/entity/count.attempt.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SecurityDevicesRepositoryTypeorm extends ISecurityDevicesRepository {
  constructor(
    @InjectRepository(RefreshTokenDataEntity)
    private readonly refreshTokenDataCollection: Repository<RefreshTokenDataEntity>,
    @InjectRepository(CountAttemptEntity)
    private readonly countAttemptCollection: Repository<CountAttemptEntity>,
  ) {
    super();
  }

  async createCountAttempt(countAttempt: CountAttemptEntity) {
    await this.countAttemptCollection.save(countAttempt);
  }

  async delAllDevicesExcludeCurrent(deviceId: string, userId: string) {
    await this.refreshTokenDataCollection.delete({
      userId: userId,
      deviceId: Not(deviceId),
    });
  }

  async delAllDevicesUser(userId: string) {
    await this.refreshTokenDataCollection.delete(userId);
  }

  async delDevice(deviceId: string): Promise<boolean> {
    const result = await this.refreshTokenDataCollection.delete(deviceId);
    return result.affected === 1;
  }

  async delOldRefreshTokenData(date: number) {
    const timeInSeconds = Math.round(date / 1000);
    await this.refreshTokenDataCollection.delete({
      exp: LessThan(timeInSeconds),
    });
  }

  async getAllDevicesUser(userId: string): Promise<DeviceInfoDto[]> {
    const deviceInfo = await this.refreshTokenDataCollection.findBy({
      userId: userId,
    });
    return deviceInfo.map((a) => {
      return {
        ip: a.ip,
        title: a.deviceName,
        lastActiveDate: new Date(a.iat * 1000).toISOString(),
        deviceId: a.deviceId,
      };
    });
  }

  async getDevice(deviceId: string): Promise<RefreshTokenDataEntity> {
    return this.refreshTokenDataCollection.findOneBy({
      deviceId: deviceId,
    });
  }

  async getInfoAboutDeviceUser(
    userId: string,
    deviceId: string,
  ): Promise<RefreshTokenDataEntity> {
    return this.refreshTokenDataCollection.findOneBy({
      userId: userId,
      deviceId: deviceId,
    });
  }

  async getIpDevice(ip: string) {
    return this.countAttemptCollection.findOneBy({ ip: ip });
  }

  async save(infoRefreshToken: RefreshTokenDataEntity) {
    await this.refreshTokenDataCollection.save(infoRefreshToken);
  }

  async updateCountAttempt(countAttempt: number, ip: string): Promise<void> {
    await this.countAttemptCollection.update(
      { ip: ip },
      { countAttempt: countAttempt },
    );
  }

  async updateCountAttemptMany(
    countAttempt: number,
    iat: number,
    method: string,
    originalUrl: string,
    dataIpDevice: string,
  ): Promise<void> {
    await this.countAttemptCollection.update(
      { ip: dataIpDevice },
      {
        countAttempt: countAttempt,
        iat: iat,
        method: method,
        originalUrl: originalUrl,
      },
    );
  }
}
