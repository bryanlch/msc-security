import { Permission } from 'src/features/permissions/entities/permission.entity';
import { User } from 'src/features/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rol')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  name: string;

  @Column()
  status: boolean;

  @OneToMany(() => Permission, (permission) => permission.rolId)
  permission: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
