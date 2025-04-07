import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Action } from 'src/features/action/entities/action.entity';
import { Role } from 'src/features/role/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rolId: number;

  @Column()
  actionId: number;

  @ManyToOne(() => Role, (role) => role.permission)
  @JoinColumn({ name: 'rolId' })
  role: Role;

  @ManyToOne(() => Action, (action) => action.permission)
  action: Action;
}
