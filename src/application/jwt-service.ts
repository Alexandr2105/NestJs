import jwt from 'jsonwebtoken';
import { settings } from '../settings';
import { ItemsUsers } from '../helper/allTypes';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  creatJWT(user: ItemsUsers) {
    return jwt.sign({ userId: user.id }, settings.JWT_SECRET, {
      expiresIn: settings.TOKEN_LIFE,
    });
  }

  creatRefreshJWT(user: ItemsUsers, deviceId: string) {
    return jwt.sign(
      {
        userId: user.id,
        deviceId: deviceId,
      },
      settings.REFRESH_TOKEN_SECRET,
      { expiresIn: settings.REFRESH_TOKEN_LIFE },
    );
  }

  getUserIdByToken(token: string) {
    try {
      const result: any = jwt.verify(token, settings.JWT_SECRET);
      return new Object(result.userId);
    } catch (error) {
      return null;
    }
  }

  getUserByRefreshToken(token: string) /*:Object | null*/ {
    try {
      const result = jwt.verify(token, settings.REFRESH_TOKEN_SECRET);
      return new Object(result);
    } catch (error) {
      return null;
    }
  }

  getDeviceIdRefreshToken(token: string) {
    try {
      const result: any = jwt.verify(token, settings.REFRESH_TOKEN_SECRET);
      return new Object(result.deviceId);
    } catch (error) {
      return null;
    }
  }
}
