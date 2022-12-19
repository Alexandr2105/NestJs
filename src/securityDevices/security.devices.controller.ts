import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { SecurityDevicesService } from './security-devices.service';
import { SecurityDevicesRepository } from './security.devices.repository';
import { JwtService } from '../application/jwt-service';

@Controller()
export class SecurityDevicesController {
  constructor(
    @Inject(SecurityDevicesService)
    protected devicesService: SecurityDevicesService,
    @Inject(SecurityDevicesRepository)
    protected securityDevicesRepository: SecurityDevicesRepository,
    @Inject(JwtService) protected jwtService: JwtService,
  ) {}

  @Get()
  async getDevices(@Req() req, @Res() res) {
    const user: any = this.jwtService.getUserByRefreshToken(
      req.cookies.refreshToken,
    );
    const allDevicesUser =
      await this.securityDevicesRepository.getAllDevicesUser(user.userId);
    res.send(allDevicesUser);
  }

  @Delete()
  async deleteDevices(@Req() req, @Res() res) {
    const user: any = this.jwtService.getUserByRefreshToken(
      req.cookies.refreshToken,
    );
    await this.devicesService.delAllDevicesExcludeCurrent(user.deviceId);
    res.sendStatus(204);
  }

  @Delete(':deviceId')
  async deleteDevice(
    @Param('deviceId') deviceId: string,
    @Req() req,
    @Res() res,
  ) {
    const result = await this.devicesService.delDevice(deviceId);
    if (result) res.sendStatus(204);
  }
}
