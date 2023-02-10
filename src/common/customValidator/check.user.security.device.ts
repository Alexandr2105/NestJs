import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ISecurityDevicesRepository } from '../../features/public/securityDevices/i.security.devices.repository';

@ValidatorConstraint({ name: 'comment', async: true })
@Injectable()
export class CheckUserSecurityDevice implements ValidatorConstraintInterface {
  constructor(
    private readonly securityDeviceRepository: ISecurityDevicesRepository,
  ) {}

  async validate(id: string): Promise<boolean> {
    const deviceId = await this.securityDeviceRepository.getDevice(id);
    if (!deviceId) {
      throw new NotFoundException();
    } else {
      return true;
    }
  }
}
