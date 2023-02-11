import { Prop } from '@nestjs/mongoose';
import { Validate } from 'class-validator';
import { CheckUserSecurityDevice } from '../../../../common/customValidators/check.user.security.device';

export class DeviceInfoDto {
  @Prop()
  public ip: string;
  @Prop()
  public title: string;
  @Prop()
  public lastActiveDate: string;
  @Prop()
  public deviceId: string;
}

export class CheckDeviceId {
  @Validate(CheckUserSecurityDevice)
  deviceId: string;
}
