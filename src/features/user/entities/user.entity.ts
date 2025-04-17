import { RolesEntity } from 'src/features/role/entities/role.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  Relation,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  rolId: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  status: boolean;

  @Column({ nullable: false })
  verifyAccount: boolean;

  @ManyToOne(() => RolesEntity, (rol) => rol.users)
  role: Relation<RolesEntity>;

  @CreateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'createdAt',
  })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updatedAt' })
  updatedAt: Date;
}
