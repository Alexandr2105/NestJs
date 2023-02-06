import { RefreshTokenDocument } from '../../../common/schemas/refresh.token.data.schema';
import { DeviceInfoDto } from './dto/device.info.dto';

export abstract class ISecurityDevicesRepository {
  abstract save(infoRefreshToken: RefreshTokenDocument);
  abstract delAllDevicesExcludeCurrent(deviceId: string);
  abstract delDevice(deviceId: string): Promise<boolean>;
  abstract delAllDevicesUser(userId: string);
  abstract getAllDevicesUser(userId: string): Promise<DeviceInfoDto[]>;
  abstract delOldRefreshTokenData(date: number);
  abstract getInfoAboutDeviceUser(
    userId: string,
    deviceId: string,
  ): Promise<RefreshTokenDocument>;
  abstract getDevice(deviceId: string);
}