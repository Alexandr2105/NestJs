import { Prop } from '@nestjs/mongoose';

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
