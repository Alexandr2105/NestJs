import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CountAttemptDocument } from '../schemas/count.attempt.schema';

@Injectable()
export class CountAttemptGuard implements CanActivate {
  constructor(
    @InjectModel('countAttempts')
    protected countAttemptCollection: Model<CountAttemptDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const dataIpDevice = await this.countAttemptCollection.findOne({
      ip: req.ip,
    });
    if (!dataIpDevice) {
      await this.countAttemptCollection.create({
        ip: req.ip,
        iat: +new Date(),
        method: req.method,
        originalUrl: req.originalUrl,
        countAttempt: 1,
      });
      return true;
    }
    if (+new Date() - dataIpDevice.iat > 10000) {
      await this.countAttemptCollection.updateMany(
        { ip: dataIpDevice?.ip },
        {
          $set: {
            countAttempt: 1,
            iat: +new Date(),
            method: req.method,
            originalUrl: req.originalUrl,
          },
        },
      );
      return true;
    } else {
      if (
        dataIpDevice?.countAttempt < 5 &&
        dataIpDevice.method === req.method &&
        dataIpDevice.originalUrl === req.originalUrl
      ) {
        const count = dataIpDevice.countAttempt + 1;
        await this.countAttemptCollection.updateOne(
          { ip: dataIpDevice?.ip },
          { $set: { countAttempt: count } },
        );
        return true;
      } else if (
        dataIpDevice?.countAttempt < 5 ||
        dataIpDevice.method !== req.method ||
        dataIpDevice.originalUrl !== req.originalUrl
      ) {
        await this.countAttemptCollection.updateMany(
          { ip: dataIpDevice?.ip },
          {
            $set: {
              countAttempt: 1,
              iat: +new Date(),
              method: req.method,
              originalUrl: req.originalUrl,
            },
          },
        );
        return true;
      } else {
        res.sendStatus(429);
      }
    }
  }
}
