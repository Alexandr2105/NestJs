import { settings } from '../settings';
import { ItemsUsers } from '../helper/allTypes';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class Jwt {
  constructor(protected jwt: JwtService, protected refreshT: JwtService) {}

  creatJWT(user: ItemsUsers) {
    return {
      accessToken: this.jwt.sign(
        { userId: user.id },
        { expiresIn: settings.TOKEN_LIFE, secret: settings.JWT_SECRET },
      ),
    };
  }

  creatRefreshJWT(user: ItemsUsers, deviceId: string) {
    return this.refreshT.sign(
      {
        userId: user.id,
        deviceId: deviceId,
      },
      {
        expiresIn: settings.REFRESH_TOKEN_LIFE,
        secret: settings.REFRESH_TOKEN_SECRET,
      },
    );
  }

  getUserIdByToken(token: string) {
    try {
      const result: any = this.jwt.verify(token, {
        secret: settings.JWT_SECRET,
      });
      return new Object(result.userId);
    } catch (error) {
      return null;
    }
  }

  getUserByRefreshToken(token: string) /*:Object | null*/ {
    try {
      const result = this.jwt.verify(token, {
        secret: settings.REFRESH_TOKEN_SECRET,
      });
      return new Object(result);
    } catch (error) {
      return null;
    }
  }

  getDeviceIdRefreshToken(token: string) {
    try {
      const result: any = this.jwt.verify(token, {
        secret: settings.REFRESH_TOKEN_SECRET,
      });
      return new Object(result.deviceId);
    } catch (error) {
      return null;
    }
  }
}
