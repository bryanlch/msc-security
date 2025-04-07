import { Action } from 'src/features/action/entities/action.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('module')
export class Modules {
     @PrimaryGeneratedColumn()
     id: number;

     @Column({ length: 30 })
     name: string;

     @Column({ length: 255, nullable: true })
     description: string;

     @Column({ length: 255, nullable: true })
     path: string;

     @Column({ nullable: true })
     parentId: number;

     @ManyToOne(() => Modules, { nullable: true })
     @JoinColumn({ name: 'parentId' })
     parentModule: Modules;

     @OneToMany(() => Modules, (module) => module.parentModule)
     childrenModules: Modules[];

     @OneToMany(() => Action, (action) => action.module)
     action: Action[];
}
