import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { adminPassword } from '../../features/public/auth/auth-users/usersPasswords';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }
  public validate = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    if (
      username === adminPassword.username &&
      password === adminPassword.password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
