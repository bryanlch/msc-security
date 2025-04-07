import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Modules } from 'src/features/module/entities/module.entity';
import { Permission } from 'src/features/permissions/entities/permission.entity';

@Entity('action')
export class Action {
     @PrimaryGeneratedColumn()
     id: number;

     @Column()
     moduleId: number;

     @Column({ enum: ['READ', 'WRITE', 'DELETE'] })
     action: string;

     @ManyToOne(() => Modules, (module) => module.action)
     module: Modules;

     @OneToMany(() => Permission, (permission) => permission.actionId)
     permission: Permission[];
}