import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SecurityDevicesService } from './application/security-devices.service';
import { Jwt } from '../auth/jwt';
import { CheckDeviceId } from './dto/device.info.dto';
import { RefreshAuthGuard } from '../../../common/guard/refresh.auth.guard';
import { ISecurityDevicesRepository } from './i.security.devices.repository';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly devicesService: SecurityDevicesService,
    private readonly securityDevicesRepository: ISecurityDevicesRepository,
    private readonly jwtService: Jwt,
  ) {}

  @UseGuards(RefreshAuthGuard)
  @Get()
  async getDevices(@Req() req) {
    const user: any = this.jwtService.getUserByRefreshToken(
      req.cookies.refreshToken,
    );
    return await this.securityDevicesRepository.getAllDevicesUser(user.userId);
  }

  @UseGuards(RefreshAuthGuard)
  @HttpCode(204)
  @Delete()
  async deleteDevices(@Req() req) {
    await this.devicesService.delAllDevicesExcludeCurrent(
      req.user.deviceId,
      req.user.userId,
    );
    return;
  }

  @UseGuards(RefreshAuthGuard)
  @HttpCode(204)
  @Delete(':deviceId')
  async deleteDevice(@Param() param: CheckDeviceId, @Req() req) {
    const device = await this.securityDevicesRepository.getDevice(
      param.deviceId,
    );
    if (device.userId !== req.user.userId) throw new ForbiddenException();
    const result = await this.devicesService.delDevice(param.deviceId);
    if (result) return;
  }
}
