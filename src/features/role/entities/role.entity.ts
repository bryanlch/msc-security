import { PermissionsEntity } from 'src/features/permissions/entities/permission.entity';
import { UserEntity } from 'src/features/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  Relation,
} from 'typeorm';

@Entity('rol')
export class RolesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  name: string;

  @Column({ type: 'enum', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'INACTIVE';

  @OneToMany(() => PermissionsEntity, (permission) => permission.rolId)
  permission: Relation<PermissionsEntity[]>;

  @OneToMany(() => UserEntity, (user) => user.role)
  users: Relation<UserEntity[]>;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
