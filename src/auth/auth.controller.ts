import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { Jwt } from '../application/jwt';
import { AuthService } from './auth.service';
import { EmailManager } from '../manager/email-manager';
import { SecurityDevicesService } from '../securityDevices/security-devices.service';
import { EmailConfirmationDocument } from '../schemas/email.confirmation.schema';
import {
  EmailResending,
  LoginDto,
  NewPassword,
  RegistrationConformation,
} from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/user.dto';
import { LocalAuthGuard } from '../guard/local.auth.guard';
import { JwtAuthGuard } from '../guard/jwt.auth.guard';
import { RefreshAuthGuard } from '../guard/refresh.auth.guard';
import { CountAttemptGuard } from '../guard/count.attempt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) protected authService: AuthService,
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(SecurityDevicesService)
    protected devicesService: SecurityDevicesService,
    @Inject(EmailManager) protected emailManager: EmailManager,
    @Inject(Jwt) protected jwtService: Jwt,
  ) {}

  @UseGuards(CountAttemptGuard)
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async loginUser(@Request() req, @Body() body: LoginDto, @Res() res) {
    const accessToken = this.jwtService.creatJWT(req.user);
    const deviceId = this.devicesService.createDeviceId();
    const refreshToken = this.jwtService.creatRefreshJWT(req.user, deviceId);
    const infoRefreshToken: any =
      this.jwtService.getUserByRefreshToken(refreshToken);
    await this.devicesService.saveInfoAboutDevicesUser({
      iat: infoRefreshToken.iat,
      exp: infoRefreshToken.exp,
      deviceId: deviceId,
      userId: infoRefreshToken.userId,
      ip: req.ip,
      deviceName: req.headers['user-agent'],
    });
    await this.devicesService.delOldRefreshTokenData(+new Date());
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
    });
    res.send(accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getInfoAboutMe(@Request() req) {
    const user = await this.usersService.getUserById(req.user.id);
    if (user)
      return {
        email: user.email,
        login: user.login,
        userId: user.id,
      };
  }

  @UseGuards(CountAttemptGuard)
  @HttpCode(204)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() body: RegistrationConformation) {
    const userByCode: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(body.code);
    await this.usersRepository.updateEmailConfirmation(userByCode?.userId);
  }

  @UseGuards(CountAttemptGuard)
  @HttpCode(204)
  @Post('registration')
  async registration(@Body() body: CreateUserDto) {
    const newUser = await this.usersService.creatNewUsers(body);
    if (newUser) await this.authService.confirmation(newUser.id, body);
  }

  @UseGuards(CountAttemptGuard)
  @HttpCode(204)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() body: EmailResending) {
    const newCode: any = await this.authService.getNewConfirmationCode(body);
    await this.emailManager.sendEmailAndConfirm(body, newCode);
  }

  @UseGuards(CountAttemptGuard)
  @UseGuards(RefreshAuthGuard)
  @Post('refresh-token')
  async createRefreshToken(@Request() req, @Res() res) {
    const token = this.jwtService.creatJWT(req.user);
    const refreshToken = this.jwtService.creatRefreshJWT(
      req.user,
      req.user.deviceId,
    );
    const infoRefreshToken: any =
      this.jwtService.getUserByRefreshToken(refreshToken);
    await this.devicesService.updateInfoAboutDeviceUser({
      iat: infoRefreshToken.iat,
      exp: infoRefreshToken.exp,
      deviceId: req.user.deviceId,
      ip: req.ip,
      deviceName: req.headers['user-agent'],
      userId: req.user.userId,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
    });
    res.send(token);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Res() res) {
    const result = await this.devicesService.delDevice(req.user.deviceId);
    if (result) res.sendStatus(204);
  }

  @UseGuards(CountAttemptGuard)
  @HttpCode(204)
  @Post('password-recovery')
  async passwordRecovery(@Body() body: EmailResending) {
    const recoveryCode: any = await this.authService.getNewConfirmationCode(
      body,
    );
    await this.emailManager.sendEmailPasswordRecovery(body, recoveryCode);
  }

  @UseGuards(CountAttemptGuard)
  @HttpCode(204)
  @Post('new-password')
  async createNewPassword(@Body() body: NewPassword) {
    const userByCode: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(body.recoveryCode);
    await this.usersRepository.updateEmailConfirmation(userByCode?.userId);
    const user: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(body.recoveryCode);
    await this.usersService.createNewPassword(body.newPassword, user?.userId);
  }
}
