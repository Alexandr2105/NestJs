import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ISecurityDevicesRepository } from '../../features/public/securityDevices/i.security.devices.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CountAttemptDocument } from '../schemas/count.attempt.schema';

@Injectable()
export class CountAttemptGuard implements CanActivate {
  constructor(
    private readonly securityDevicesRepository: ISecurityDevicesRepository,
    @InjectModel('countAttempts')
    private readonly countAttemptCollection: Model<CountAttemptDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const dataIpDevice = await this.securityDevicesRepository.getIpDevice(
      req.ip,
    );
    if (!dataIpDevice) {
      const countAttempt = new this.countAttemptCollection({
        ip: req.ip,
        iat: Math.floor(+new Date() / 1000),
        method: req.method,
        originalUrl: req.originalUrl,
        countAttempt: 1,
      });
      await this.securityDevicesRepository.createCountAttempt(countAttempt);
      return true;
    }
    if (Math.floor(+new Date() / 1000) - dataIpDevice.iat > 10) {
      await this.securityDevicesRepository.updateCountAttemptMany(
        1,
        Math.floor(+new Date() / 1000),
        req.method,
        req.originalUrl,
        dataIpDevice?.ip,
      );
      return true;
    } else {
      if (
        dataIpDevice?.countAttempt < 5 &&
        dataIpDevice.method === req.method &&
        dataIpDevice.originalUrl === req.originalUrl
      ) {
        const count = dataIpDevice.countAttempt + 1;
        await this.securityDevicesRepository.updateCountAttempt(
          count,
          dataIpDevice?.ip,
        );
        return true;
      } else if (
        dataIpDevice?.countAttempt < 5 ||
        dataIpDevice.method !== req.method ||
        dataIpDevice.originalUrl !== req.originalUrl
      ) {
        await this.securityDevicesRepository.updateCountAttemptMany(
          1,
          Math.floor(+new Date() / 1000),
          req.method,
          req.originalUrl,
          dataIpDevice?.ip,
        );
        return true;
      } else {
        throw new HttpException('Too Many Request', 429);
      }
    }
  }
}
