import { RefreshTokenDocument } from '../../../common/schemas/refresh.token.data.schema';
import { CountAttempt } from '../../../common/schemas/count.attempt.schema';
import { CountAttemptEntity } from '../../../common/entity/count.attempt.entity';
import { RefreshTokenDataEntity } from '../../../common/entity/refresh.token.data.entities';

export abstract class ISecurityDevicesRepository {
  abstract save(
    infoRefreshToken: RefreshTokenDocument | RefreshTokenDataEntity,
  );
  abstract delAllDevicesExcludeCurrent(deviceId: string, userId: string);
  abstract delDevice(deviceId: string): Promise<boolean>;
  abstract delAllDevicesUser(userId: string);
  abstract getAllDevicesUser(userId: string);
  abstract delOldRefreshTokenData(date: number);
  abstract getInfoAboutDeviceUser(userId: string, deviceId: string);
  abstract getDevice(deviceId: string);
  abstract getIpDevice(ip: string);
  abstract createCountAttempt(countAttempt: CountAttempt | CountAttemptEntity);
  abstract updateCountAttemptMany(
    countAttempt: number,
    iat: number | bigint,
    method: string,
    originalUrl: string,
    dataIpDevice: string,
  );
  abstract updateCountAttempt(countAttempt: number, ip: string);
}
