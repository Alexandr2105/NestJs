import {
  Body,
  Controller,
  Get,
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
import { EmailResending, LoginDto, NewPassword } from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/user.dto';
import { LocalAuthGuard } from '../guard/local.auth.guard';
import { JwtAuthGuard } from '../guard/jwt.auth.guard';
import { RefreshAuthGuard } from '../guard/refresh.auth.guard';

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

  //TODO: удалить @Req();

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginUser(@Request() req, @Body() body: LoginDto, @Res() res) {
    const token = this.jwtService.creatJWT(req.user);
    const devId = this.devicesService.createDeviceId();
    const refresh = this.jwtService.creatRefreshJWT(req.user, devId);
    res.cookie('refresh', refresh);
    console.log(req.cookies);
    // const checkResult: any = await this.usersService.checkUserOrLogin(body);
    // const deviceId = this.devicesService.createDeviceId();
    // if (checkResult) {
    //   const token = this.jwtService.creatJWT(checkResult);
    //   const refreshToken = this.jwtService.creatRefreshJWT(
    //     checkResult,
    //     deviceId,
    //   );
    //   const infoRefreshToken: any =
    //     this.jwtService.getUserByRefreshToken(refreshToken);
    //   await this.devicesService.saveInfoAboutDevicesUser(
    //     infoRefreshToken.iat,
    //     infoRefreshToken.exp,
    //     deviceId,
    //     infoRefreshToken.userId,
    //     req.ip,
    //     req.headers['user-agent'],
    //   );
    //   await this.devicesService.delOldRefreshTokenData(+new Date());
    //   res.cookie('refreshToken', refreshToken, {
    //     httpOnly: true,
    //     secure: true,
    //   });
    //   res.send({ accessToken: token });
    // } else {
    //   res.sendStatus(401);
    // }
    res.send(token);
    // return token;
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

  @Post('registration-conformation')
  async registrationConfirmation(@Body() code: string, @Res() res) {
    const userByCode: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(code);
    await this.usersRepository.updateEmailConfirmation(userByCode?.userId);
    res.sendStatus(204);
  }

  @Post('registration')
  async registration(@Body() body: CreateUserDto, @Res() res) {
    const newUser = await this.usersService.creatNewUsers(body);
    if (newUser) await this.authService.confirmation(newUser.id, body);
    res.sendStatus(204);
  }

  @Post('registration-email-resending')
  async registrationEmailResending(@Body() body: EmailResending, @Res() res) {
    const newCode: any = await this.authService.getNewConfirmationCode(body);
    const result = await this.emailManager.sendEmailAndConfirm(body, newCode);
    if (result) res.sendStatus(204);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh-token')
  async createRefreshToken(@Request() req) {
    // const s = this.jwtService.creatRefreshJWT(req.user);
    console.log(req.user);

    // const userId: any = await this.jwtService.getUserByRefreshToken(
    //   req.cookies.refreshToken,
    // );
    // const user: any = await this.usersRepository.getUserId(
    //   userId.userId.toString(),
    // );
    // const deviceId: any = await this.jwtService.getDeviceIdRefreshToken(
    //   req.cookies.refreshToken,
    // );
    // const token = this.jwtService.creatJWT(user);
    // const refreshToken = this.jwtService.creatRefreshJWT(user, deviceId);
    // const infoRefreshToken: any =
    //   this.jwtService.getUserByRefreshToken(refreshToken);
    // await this.devicesService.updateInfoAboutDeviceUser(
    //   infoRefreshToken.iat,
    //   infoRefreshToken.exp,
    //   deviceId.toString(),
    //   req.ip,
    //   req.headers['user-agent'],
    //   userId.userId,
    // );
    // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    // res.send({ accessToken: token });
  }

  @Post('logout')
  async logout(@Request() req, @Res() res) {
    const user: any = await this.jwtService.getUserByRefreshToken(
      req.cookies.refreshToken,
    );
    const result = await this.devicesService.delDevice(user.deviceId);
    if (result) res.sendStatus(204);
  }

  @Post('password-recovery')
  async passwordRecovery(@Body() body: EmailResending, @Res() res) {
    const recoveryCode: any = await this.authService.getNewConfirmationCode(
      body,
    );
    await this.emailManager.sendEmailPasswordRecovery(body, recoveryCode);
    res.sendStatus(204);
  }

  @Post('new-password')
  async createNewPassword(@Body() body: NewPassword, @Res() res) {
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
