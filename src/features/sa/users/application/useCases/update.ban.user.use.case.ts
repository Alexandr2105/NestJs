import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users.repository';
import { BanUserDto } from '../../dto/user.dto';
import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BanUser } from '../../schema/banUser';
import { SecurityDevicesRepository } from '../../../../public/securityDevices/security.devices.repository';

export class BanUserCommand {
  constructor(public userId: string, public body: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class UpdateBanUserUseCase {
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected userRepository: UsersRepository,
    @InjectModel('banUsers') protected banUsers: Model<BanUser>,
  ) {}
  async execute(command: BanUserCommand) {
    const user = await this.userRepository.getUserByIdAll(command.userId);
    if (!user) throw new NotFoundException();
    user.ban = command.body.isBanned;
    await this.userRepository.save(user);
    const banInfo = new this.banUsers(command.body);
    banInfo.banDate = new Date().toISOString();
    banInfo.userId = command.userId;
    await this.userRepository.saveBan(banInfo);
    if (user.ban === true) {
      await this.securityDevicesRepository.delAllDevicesUser(user.id);
    }
  }
}
