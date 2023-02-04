import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { settings } from '../../settings';
import { Request } from 'express';
import { ISecurityDevicesRepository } from '../../features/public/securityDevices/i.security.devices.repository';

@Injectable()
export class RefreshStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(
    private readonly securityDevicesRepository: ISecurityDevicesRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: settings.REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload) {
    const device = await this.securityDevicesRepository.getInfoAboutDeviceUser(
      payload.userId,
      payload.deviceId,
    );
    if (device.iat !== payload.iat) {
      return false;
    }
    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
