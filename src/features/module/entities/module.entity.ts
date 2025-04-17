import { ActionsEntity } from 'src/features/action/entities/action.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';

@Entity('module')
export class ModulesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ nullable: true })
  order: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'enum', enum: ['MENU', 'LINK', 'ACTION'], default: 'MENU' })
  type: 'MENU' | 'LINK' | 'ACTION';

  @Column({ default: true })
  isVisible: boolean;

  @Column({ length: 255, nullable: true })
  path: string;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => ModulesEntity, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parentModule: Relation<ModulesEntity>;

  @OneToMany(() => ModulesEntity, (module) => module.parentModule)
  childrenModules: Relation<ModulesEntity[]>;

  @OneToMany(() => ActionsEntity, (action) => action.module)
  action: Relation<ActionsEntity[]>;
}
