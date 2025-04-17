import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { ModulesEntity } from 'src/features/module/entities/module.entity';
import { PermissionsEntity } from 'src/features/permissions/entities/permission.entity';

@Entity('action')
export class ActionsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  moduleId: number;

  @Column({ enum: ['READ', 'WRITE', 'DELETE'] })
  action: string;

  @ManyToOne(() => ModulesEntity, (module) => module.action)
  module: Relation<ModulesEntity>;

  @OneToMany(() => PermissionsEntity, (permission) => permission.actionId)
  permission: Relation<PermissionsEntity[]>;
}
