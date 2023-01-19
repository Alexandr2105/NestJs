import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../features/sa/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(protected usersService: UsersService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }
  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.usersService.checkUserOrLogin({
      loginOrEmail,
      password,
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
