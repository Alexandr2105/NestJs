import { CommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../../dto/user.dto';
import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BanUsers } from '../../schema/banUsers';
import { ISecurityDevicesRepository } from '../../../../public/securityDevices/i.security.devices.repository';
import { IUsersRepository } from '../../i.users.repository';

export class BanUserCommand {
  constructor(public userId: string, public body: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class UpdateBanUserUseCase {
  constructor(
    private readonly securityDevicesRepository: ISecurityDevicesRepository,
    private readonly userRepository: IUsersRepository,
    @InjectModel('banUsers') protected banUsers: Model<BanUsers>,
  ) {}
  async execute(command: BanUserCommand) {
    const user = await this.userRepository.getUserByIdAll(command.userId);
    if (!user) throw new NotFoundException();
    user.ban = command.body.isBanned;
    await this.userRepository.save(user);
    const ban = await this.banUsers.findOne({ userId: user.id });
    if (!ban && user.ban === false) return;
    if (ban && user.ban === false) {
      await this.userRepository.deleteBanUsers(user.id);
    } else {
      const banInfo = new this.banUsers(command.body);
      banInfo.banDate = new Date().toISOString();
      banInfo.userId = command.userId;
      await this.userRepository.saveBan(banInfo);
      if (user.ban === true) {
        await this.securityDevicesRepository.delAllDevicesUser(user.id);
      }
    }
  }
}
