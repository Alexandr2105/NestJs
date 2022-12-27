import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenData } from '../schemas/refresh.token.data.schema';

@ValidatorConstraint({ name: 'comment', async: true })
@Injectable()
export class CheckIdComment implements ValidatorConstraintInterface {
  constructor(
    @InjectModel('refreshTokenData')
    protected refreshTokenDataCollection: Model<RefreshTokenData>,
  ) {}

  async validate(id: string): Promise<any> {
    const deviceId = await this.refreshTokenDataCollection.findOne({
      deviceId: id,
    });
    if (!deviceId) {
      throw new NotFoundException();
    }
    //TODO:когда сделаю авторизацию, тогда надо будет с этим разобраться!!!
    // if (deviceId.userId !== req.user.userId) {
    //   throw new ForbiddenException();
    // }
  }
}
