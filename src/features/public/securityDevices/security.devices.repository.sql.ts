import { ISecurityDevicesRepository } from './i.security.devices.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceInfoDto } from './dto/device.info.dto';
import { RefreshTokenDocument } from '../../../common/schemas/refresh.token.data.schema';
import { Injectable } from '@nestjs/common';
import { CountAttempt } from '../../../common/schemas/count.attempt.schema';

@Injectable()
export class SecurityDevicesRepositorySql extends ISecurityDevicesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async getAllDevicesUser(userId: string): Promise<DeviceInfoDto[]> {
    const deviceInfo = await this.dataSource.query(
      `SELECT * FROM public."RefreshTokenData"
       WHERE "userId" =$1;`,
      [userId],
    );
    return deviceInfo.map((a) => {
      return {
        ip: a.ip,
        title: a.deviceName,
        lastActiveDate: new Date(a.iat).toISOString(),
        deviceId: a.deviceId,
      };
    });
  }

  async getDevice(deviceId: string) {
    const device = await this.dataSource.query(
      `SELECT * FROM public."RefreshTokenData" 
            WHERE "deviceId" =$1`,
      [deviceId],
    );
    return device[0];
  }

  async getInfoAboutDeviceUser(
    userId: string,
    deviceId: string,
  ): Promise<RefreshTokenDocument> {
    const deviceInfo = await this.dataSource.query(
      `SELECT * FROM public."RefreshTokenData"
             WHERE "userId"=$1 AND "deviceId"=$2`,
      [userId, deviceId],
    );
    return deviceInfo[0];
  }

  async delAllDevicesExcludeCurrent(deviceId: string) {
    await this.dataSource.query(
      `DELETE FROM public."RefreshTokenData"
             WHERE NOT "deviceId"=$1`,
      [deviceId],
    );
  }

  async delAllDevicesUser(userId: string) {
    await this.dataSource.query(
      `DELETE FROM public."RefreshTokenData"
             WHERE "userId"=$1`,
      [userId],
    );
  }

  async delDevice(deviceId: string): Promise<boolean> {
    const device = await this.dataSource.query(
      `DELETE FROM public."RefreshTokenData"
             WHERE "deviceId"=$1`,
      [deviceId],
    );
    return device[0];
  }

  async delOldRefreshTokenData(date: number) {
    const timeInSeconds = Math.round(date / 1000);
    await this.dataSource.query(
      `DELETE FROM public."RefreshTokenData"
             WHERE "exp"=$1`,
      [timeInSeconds],
    );
  }

  async save(infoRefreshToken: RefreshTokenDocument) {
    if (
      !(await this.getInfoAboutDeviceUser(
        infoRefreshToken.userId,
        infoRefreshToken.deviceId,
      ))
    ) {
      await this.dataSource.query(
        `INSERT INTO public."RefreshTokenData"
            ("iat", "exp", "deviceId", "ip", "deviceName", "userId") 
            VALUES ($1, $2, $3, $4, $5, $6);`,
        [
          infoRefreshToken.iat,
          infoRefreshToken.exp,
          infoRefreshToken.deviceId,
          infoRefreshToken.ip,
          infoRefreshToken.deviceName,
          infoRefreshToken.userId,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public."RefreshTokenData"
              SET "iat"=$1,"exp"=$2,"ip"=$3,"deviceName"=$4
              WHERE "deviceId"=$5 AND "userId"=$6`,
        [
          infoRefreshToken.iat,
          infoRefreshToken.exp,
          infoRefreshToken.ip,
          infoRefreshToken.deviceName,
          infoRefreshToken.deviceId,
          infoRefreshToken.userId,
        ],
      );
    }
  }

  async getIpDevice(ip: string) {
    const device = await this.dataSource.query(
      `SELECT * FROM public."CountAttempts"
            WHERE "ip"=$1`,
      [ip],
    );
    return device[0];
  }

  async createCountAttempt(countAttempt: CountAttempt) {
    await this.dataSource.query(
      `INSERT INTO public."CountAttempts"
            ("ip", "iat", "method", "originalUrl", "countAttempt")
            VALUES ($1, $2, $3, $4, $5)`,
      [
        countAttempt.ip,
        countAttempt.iat,
        countAttempt.method,
        countAttempt.originalUrl,
        countAttempt.countAttempt,
      ],
    );
  }

  async updateCountAttemptMany(
    countAttempt: number,
    iat: number,
    method: string,
    originalUrl: string,
    dataIpDevice: string,
  ) {
    await this.dataSource.query(
      `UPDATE public."CountAttempts"
            SET "iat"=$1, "method"=$2, "originalUrl"=$3, "countAttempt"=$4
            WHERE "ip"=$5`,
      [iat, method, originalUrl, countAttempt, dataIpDevice],
    );
  }

  async updateCountAttempt(countAttempts: number, ip: string) {
    await this.dataSource.query(
      `UPDATE public."CountAttempts"
            SET "countAttempt"=$1
            WHERE "ip"=$2`,
      [ip, countAttempts],
    );
  }
}
