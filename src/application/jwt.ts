import { settings } from '../settings';
import { ItemsUsers } from '../helper/allTypes';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class Jwt {
  constructor(protected jwt: JwtService, protected refreshToken: JwtService) {}

  creatJWT(user: ItemsUsers) {
    return {
      accessToken: this.jwt.sign(
        { userId: user.id },
        { expiresIn: settings.TOKEN_LIFE, secret: settings.JWT_SECRET },
      ),
    };
  }

  creatRefreshJWT(userId: string, deviceId: string) {
    return this.refreshToken.sign(
      {
        userId: userId,
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
      return result.userId;
    } catch (error) {
      return null;
    }
  }

  getUserByRefreshToken(token: string) {
    try {
      const result = this.jwt.verify(token, {
        secret: settings.REFRESH_TOKEN_SECRET,
      });
      return new Object(result);
    } catch (error) {
      return null;
    }
  }
}
