import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '../application/jwt-service';
import { AuthService } from './auth.service';
import { EmailManager } from '../manager/email-manager';
import { SecurityDevicesService } from '../securityDevices/security-devices.service';
import { EmailConfirmationDocument } from '../schemas/email.confirmation.schema';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) protected authService: AuthService,
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(SecurityDevicesService)
    protected devicesService: SecurityDevicesService,
    @Inject(EmailManager) protected emailManager: EmailManager,
    @Inject(JwtService) protected jwtService: JwtService,
  ) {}

  //TODO: удалить @Req();

  @Post('login')
  async loginUser(@Body() body, @Req() req, @Res() res) {
    const checkResult: any = await this.usersService.checkUserOrLogin(
      body.loginOrEmail,
      body.password,
    );
    const deviceId = this.devicesService.createDeviceId();
    if (checkResult) {
      const token = this.jwtService.creatJWT(checkResult);
      const refreshToken = this.jwtService.creatRefreshJWT(
        checkResult,
        deviceId,
      );
      const infoRefreshToken: any =
        this.jwtService.getUserByRefreshToken(refreshToken);
      await this.devicesService.saveInfoAboutDevicesUser(
        infoRefreshToken.iat,
        infoRefreshToken.exp,
        deviceId,
        infoRefreshToken.userId,
        req.ip,
        req.headers['user-agent'],
      );
      await this.devicesService.delOldRefreshTokenData(+new Date());
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      });
      res.send({ accessToken: token });
    } else {
      res.sendStatus(401);
    }
  }

  @Get('me')
  async getInfoAboutMe(@Req() req, @Res() res) {
    const information = {
      email: req.user?.email,
      login: req.user?.login,
      userId: req.user?.id,
    };
    res.send(information);
  }

  @Post('registration-conformation')
  async registrationConfirmation(@Body() body, @Res() res) {
    const userByCode: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(body.code);
    await this.usersRepository.updateEmailConfirmation(userByCode?.userId);
    res.sendStatus(204);
  }

  @Post('registration')
  async registration(@Body() body, @Res() res) {
    const newUser = await this.usersService.creatNewUsers(body);
    if (newUser)
      await this.authService.confirmation(newUser.id, body.login, body.email);
    res.sendStatus(204);
  }

  @Post('registration-email-resending')
  async registrationEmailResending(@Body() body, @Res() res) {
    const newCode: any = await this.authService.getNewConfirmationCode(
      body.email,
    );
    const result = await this.emailManager.sendEmailAndConfirm(
      body.email,
      newCode,
    );
    if (result) res.sendStatus(204);
  }

  @Post('refresh-token')
  async createRefreshToken(@Req() req, @Res() res) {
    const userId: any = await this.jwtService.getUserByRefreshToken(
      req.cookies.refreshToken,
    );
    const user: any = await this.usersRepository.getUserId(
      userId.userId.toString(),
    );
    const deviceId: any = await this.jwtService.getDeviceIdRefreshToken(
      req.cookies.refreshToken,
    );
    const token = this.jwtService.creatJWT(user);
    const refreshToken = this.jwtService.creatRefreshJWT(user, deviceId);
    const infoRefreshToken: any =
      this.jwtService.getUserByRefreshToken(refreshToken);
    await this.devicesService.updateInfoAboutDeviceUser(
      infoRefreshToken.iat,
      infoRefreshToken.exp,
      deviceId.toString(),
      req.ip,
      req.headers['user-agent'],
      userId.userId,
    );
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.send({ accessToken: token });
  }

  @Post('logout')
  async logout(@Req() req, @Res() res) {
    const user: any = await this.jwtService.getUserByRefreshToken(
      req.cookies.refreshToken,
    );
    const result = await this.devicesService.delDevice(user.deviceId);
    if (result) res.sendStatus(204);
  }

  @Post('password-recovery')
  async passwordRecovery(@Body() body, @Res() res) {
    const recoveryCode: any = await this.authService.getNewConfirmationCode(
      body.email,
    );
    await this.emailManager.sendEmailPasswordRecovery(body.email, recoveryCode);
    res.sendStatus(204);
  }

  @Post('new-password')
  async createNewPassword(@Body() body, @Res() res) {
    const userByCode: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(body.recoveryCode);
    await this.usersRepository.updateEmailConfirmation(userByCode!.userId);
    const user: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(body.recoveryCode);
    const newPass = await this.usersService.createNewPassword(
      body.newPassword,
      user!.userId,
    );
    if (newPass) res.sendStatus(204);
  }
}
