import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Req,
} from '@nestjs/common';
import { SecurityDevicesService } from './security-devices.service';
import { SecurityDevicesRepository } from './security.devices.repository';
import { Jwt } from '../application/jwt';
import { CheckDeviceId } from './dto/device.info.dto';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    @Inject(SecurityDevicesService)
    protected devicesService: SecurityDevicesService,
    @Inject(SecurityDevicesRepository)
    protected securityDevicesRepository: SecurityDevicesRepository,
    @Inject(Jwt) protected jwtService: Jwt,
  ) {}

  @Get()
  async getDevices(@Req() req) {
    const user: any = this.jwtService.getUserByRefreshToken(
      req.cookies.refreshToken,
    );
    return await this.securityDevicesRepository.getAllDevicesUser(user.userId);
  }

  @HttpCode(204)
  @Delete()
  async deleteDevices(@Req() req) {
    const user: any = this.jwtService.getUserByRefreshToken(
      req.cookies.refreshToken,
    );
    await this.devicesService.delAllDevicesExcludeCurrent(user.deviceId);
    return;
  }

  @HttpCode(204)
  @Delete(':deviceId')
  async deleteDevice(@Param() param: CheckDeviceId, @Req() req) {
    const device = await this.securityDevicesRepository.getDevice(
      param.deviceId,
    );
    if (!device) throw new NotFoundException();
    if (device.userId !== req.user.id) throw new ForbiddenException();
    const result = await this.devicesService.delDevice(param.deviceId);
    if (result) return;
  }
}
