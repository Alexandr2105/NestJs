import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { settings } from '../settings';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor() {
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

  validate(payload) {
    if (payload.exp < new Date()) {
      return false;
    }
    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
