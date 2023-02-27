import { IUsersRepository } from './i.users.repository';
import { BanUsersDocument } from './schema/banUsers';
import { EmailResending } from '../../public/auth/dto/auth.dto';
import { User } from './schema/user';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { EmailConfirmationEntity } from '../../../common/entity/email.confirmation.entity';
import { BanUsersEntity } from './entity/banUsers.entity';
import { add } from 'date-fns';

export class UsersRepositoryTypeorm extends IUsersRepository {
  constructor(
    private readonly usersCollection: Repository<UserEntity>,
    private readonly registrationUsersCollection: Repository<EmailConfirmationEntity>,
    private readonly banUsers: Repository<BanUsersEntity>,
  ) {
    super();
  }
  async deleteBanUsers(userId: string) {
    await this.banUsers.delete({ userId: userId });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.usersCollection.delete({ id: id });
    return result.affected === 1;
  }

  async findLoginOrEmail(logOrEmail: string): Promise<UserEntity> {
    return this.usersCollection.findOneBy([
      { login: logOrEmail },
      { email: logOrEmail },
    ]);
  }

  async getBanUser(userId: string) {
    return this.banUsers.findOneBy({ userId: userId });
  }

  async getBanUsers() {
    return this.usersCollection.findBy({ ban: true });
  }

  async getConfByUserId(userId: string) {
    return this.registrationUsersCollection.findOneBy({ userId: userId });
  }

  async getUserByCode(code: string): Promise<EmailConfirmationEntity> {
    return this.registrationUsersCollection.findOneBy({
      confirmationCode: code,
    });
  }

  async getUserByEmail(email: string) {
    return this.usersCollection.findOne({
      where: { email: email },
      select: { id: true, login: true, email: true, createdAt: true },
    });
  }

  async getUserByIdAll(id: string) {
    return this.usersCollection.findOneBy({ id: id });
  }

  async getUserId(id: string): Promise<UserEntity | false> {
    const user = await this.usersCollection.findOne({
      where: { id: id },
      select: { id: true, login: true, email: true, createdAt: true },
    });
    if (!user) return false;
    return user;
  }

  async save(user: User) {
    await this.usersCollection.save(user);
  }

  async saveBan(banInfo: BanUsersDocument) {
    await this.banUsers.save(banInfo);
  }

  async setConfirm(body: EmailResending, newCode: string): Promise<boolean> {
    const user: any = await this.usersCollection.findOneBy({
      email: body.email,
    });
    const checkUserEmailConfirmation =
      await this.registrationUsersCollection.findOneBy({
        userId: user?.id,
      });
    if (checkUserEmailConfirmation) {
      const result = await this.registrationUsersCollection.update(
        { userId: user?.id },
        { confirmationCode: newCode },
      );
      return result.affected === 1;
    } else {
      await this.registrationUsersCollection.create({
        userId: user?.id,
        confirmationCode: newCode,
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: false,
      });
      return true;
    }
  }

  async updateEmailConfirmation(id: string): Promise<boolean> {
    const result = await this.registrationUsersCollection.update(
      { userId: id },
      { isConfirmed: true },
    );
    return result.affected === 1;
  }
}
