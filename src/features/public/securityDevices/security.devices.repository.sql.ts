import { ISecurityDevicesRepository } from './i.security.devices.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceInfoDto } from './dto/device.info.dto';
import { RefreshTokenDocument } from '../../../common/schemas/refresh.token.data.schema';
import { Injectable } from '@nestjs/common';

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
    return await this.dataSource.query(
      `DELETE FROM public."RefreshTokenData"
             WHERE "deviceId"=$1`,
      [deviceId],
    );
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
              SET "iat"=$1,"exp"=$2,"deviceId"=$3,"ip"=$4
              WHERE "deviceName"=$5 AND "userId"=$6`,
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
}
