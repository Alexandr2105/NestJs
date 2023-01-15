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
export class CheckUserSecurityDevice implements ValidatorConstraintInterface {
  constructor(
    @InjectModel('refreshTokenData')
    protected refreshTokenDataCollection: Model<RefreshTokenData>,
  ) {}

  async validate(id: string): Promise<boolean> {
    const deviceId = await this.refreshTokenDataCollection.findOne({
      deviceId: id,
    });
    if (!deviceId) {
      throw new NotFoundException();
    } else {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Не верные данные';
  }
}
