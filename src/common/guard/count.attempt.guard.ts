import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ISecurityDevicesRepository } from '../../features/public/securityDevices/i.security.devices.repository';

@Injectable()
export class CountAttemptGuard implements CanActivate {
  constructor(
    private readonly securityDevicesRepository: ISecurityDevicesRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const dataIpDevice = await this.securityDevicesRepository.getIpDevice(
      req.ip,
    );
    if (!dataIpDevice) {
      await this.securityDevicesRepository.createCountAttempt({
        ip: req.ip,
        iat: +new Date(),
        method: req.method,
        originalUrl: req.originalUrl,
        countAttempt: 1,
      });
      return true;
    }
    if (+new Date() - dataIpDevice.iat > 10000) {
      await this.securityDevicesRepository.updateCountAttemptMany(
        1,
        +new Date(),
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
          dataIpDevice?.ip,
          count,
        );
        return true;
      } else if (
        dataIpDevice?.countAttempt < 5 ||
        dataIpDevice.method !== req.method ||
        dataIpDevice.originalUrl !== req.originalUrl
      ) {
        await this.securityDevicesRepository.updateCountAttemptMany(
          1,
          +new Date(),
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
