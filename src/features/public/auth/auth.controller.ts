import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../sa/users/application/users.service';
import { Jwt } from './jwt';
import { EmailManager } from '../../../common/manager/email-manager';
import { SecurityDevicesService } from '../securityDevices/application/security-devices.service';
import { EmailConfirmationDocument } from '../../../common/schemas/email.confirmation.schema';
import {
  EmailResending,
  LoginDto,
  NewPassword,
  RegistrationConformation,
} from './dto/auth.dto';
import { CreateUserDto } from '../../sa/users/dto/user.dto';
import { LocalAuthGuard } from '../../../common/guard/local.auth.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { RefreshAuthGuard } from '../../../common/guard/refresh.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../sa/users/application/useCases/create.user.use.case';
import { UpdateInfoAboutDevicesUserCommand } from '../securityDevices/application/useCase/update.info.about.device.user.use.case';
import { SaveInfoAboutDevicesUserCommand } from '../securityDevices/application/useCase/save.info.about.devices.user.use.case';
import { CreateEmailConfirmationCommand } from './application/useCase/create.email.confirmation.use.cae';
import { GetNewConfirmationCodeCommand } from './application/useCase/get.new.confirmation.code.use.case';
import { IUsersRepository } from '../../sa/users/i.users.repository';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: IUsersRepository,
    private readonly devicesService: SecurityDevicesService,
    private readonly emailManager: EmailManager,
    private readonly jwtService: Jwt,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(LocalAuthGuard)
  // @UseGuards(CountAttemptGuard)
  @HttpCode(200)
  @Post('login')
  async loginUser(@Request() req, @Body() body: LoginDto, @Res() res) {
    const accessToken = this.jwtService.creatJWT(req.user.id);
    const deviceId = this.devicesService.createDeviceId();
    const refreshToken = this.jwtService.creatRefreshJWT(req.user.id, deviceId);
    const infoRefreshToken: any =
      this.jwtService.getUserByRefreshToken(refreshToken);
    await this.commandBus.execute(
      new SaveInfoAboutDevicesUserCommand({
        iat: infoRefreshToken.iat,
        exp: infoRefreshToken.exp,
        deviceId: deviceId,
        userId: infoRefreshToken.userId,
        ip: req.ip,
        deviceName: req.headers['user-agent'],
      }),
    );
    await this.devicesService.delOldRefreshTokenData(+new Date());
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
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

  // @UseGuards(CountAttemptGuard)
  @HttpCode(204)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() body: RegistrationConformation) {
    const userByCode: EmailConfirmationDocument =
      await this.usersRepository.getUserByCode(body.code);
    await this.usersRepository.updateEmailConfirmation(userByCode?.userId);
  }

  // @UseGuards(CountAttemptGuard)
  @HttpCode(204)
  @Post('registration')
  async registration(@Body() body: CreateUserDto) {
    const newUser = await this.commandBus.execute(new CreateUserCommand(body));
    if (newUser)
      await this.commandBus.execute(
        new CreateEmailConfirmationCommand(newUser.id, body),
      );
  }

  // @UseGuards(CountAttemptGuard)
  @HttpCode(204)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() body: EmailResending) {
    const newCode: any = await this.commandBus.execute(
      new GetNewConfirmationCodeCommand(body),
    );
    await this.emailManager.sendEmailAndConfirm(body, newCode);
  }

  // @UseGuards(CountAttemptGuard)
  @UseGuards(RefreshAuthGuard)
  @HttpCode(200)
  @Post('refresh-token')
  async createRefreshToken(@Request() req, @Res() res) {
    const token = this.jwtService.creatJWT(req.user.userId);
    const refreshToken = this.jwtService.creatRefreshJWT(
      req.user.userId,
      req.user.deviceId,
    );
    const infoRefreshToken: any =
      this.jwtService.getUserByRefreshToken(refreshToken);
    await this.commandBus.execute(
      new UpdateInfoAboutDevicesUserCommand({
        iat: infoRefreshToken.iat,
        exp: infoRefreshToken.exp,
        deviceId: req.user.deviceId,
        ip: req.ip,
        deviceName: req.headers['user-agent'],
        userId: req.user.userId,
      }),
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.send(token);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Res() res) {
    const result = await this.devicesService.delDevice(req.user.deviceId);
    if (result) res.sendStatus(204);
  }

  // @UseGuards(CountAttemptGuard)
  @HttpCode(204)
  @Post('password-recovery')
  async passwordRecovery(@Body() body: EmailResending) {
    const recoveryCode: any = await this.commandBus.execute(
      new GetNewConfirmationCodeCommand(body),
    );
    await this.emailManager.sendEmailPasswordRecovery(body, recoveryCode);
  }

  // @UseGuards(CountAttemptGuard)
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
