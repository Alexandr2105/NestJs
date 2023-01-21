import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users.repository';
import { BanUserDto } from '../../dto/user.dto';
import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BanUser } from '../../schema/banUser';

export class BanUserCommand {
  constructor(public userId: string, public body: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    protected userRepository: UsersRepository,
    @InjectModel('banUsers') protected banUsers: Model<BanUser>,
  ) {}
  async execute(command: BanUserCommand) {
    const user = await this.userRepository.getUserId(command.userId);
    if (!user) throw new NotFoundException();
    user.ban = command.body.isBanned;
    await this.userRepository.save(user);
    const banInfo = new this.banUsers(command.body);
    banInfo.banDate = +new Date() + '';
    banInfo.userId = command.userId;
    await this.userRepository.saveBan(banInfo);
  }
}
