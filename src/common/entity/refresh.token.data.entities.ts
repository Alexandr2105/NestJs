import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../features/sa/users/entity/user.entity';

@Entity()
export class RefreshTokenDataEntity {
  @Column()
  iat: string;
  @Column()
  exp: string;
  @PrimaryColumn()
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  deviceName: string | undefined;
  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (u) => u.device, { onDelete: 'CASCADE' })
  user: UserEntity;
}
