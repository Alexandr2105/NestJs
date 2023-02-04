import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../features/sa/users/application/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
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
    if (user.ban === true) throw new UnauthorizedException();
    return user;
  }
}
