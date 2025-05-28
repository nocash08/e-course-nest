import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Role } from "./role.entity";
import { Exclude } from "class-transformer";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true, type: "varchar" })
  image: string | null;

  @ManyToMany(() => Role)
  @JoinTable({
    name: "user_roles",
    joinColumn: {
      name: "user_uuid",
      referencedColumnName: "uuid",
    },
    inverseJoinColumn: {
      name: "role_uuid",
      referencedColumnName: "uuid",
    },
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
