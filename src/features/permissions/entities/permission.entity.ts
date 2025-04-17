import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { ActionsEntity } from 'src/features/action/entities/action.entity';
import { RolesEntity } from 'src/features/role/entities/role.entity';

@Entity('permissions')
export class PermissionsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rolId: number;

  @Column()
  actionId: number;

  @ManyToOne(() => RolesEntity, (role) => role.permission)
  @JoinColumn({ name: 'rolId' })
  role: Relation<RolesEntity>;

  @ManyToOne(() => ActionsEntity, (action) => action.permission)
  action: Relation<ActionsEntity>;
}
