import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { usersPassword } from '../auth-users/usersPasswords';
import { Strategy } from 'passport-jwt';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }
  public validate = async (base64): Promise<boolean> => {
    if (base64 === usersPassword[0]) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
