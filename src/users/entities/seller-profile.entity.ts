import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("seller_profiles")
export class SellerProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User, (user) => user.sellerProfile)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 255 })
  fullName: string;

  @Column({ type: "varchar", length: 20 })
  phoneNumber: string;

  @Column({ type: "text" })
  address: string;

  @Column({ type: "varchar", length: 255 })
  expertise: string;

  @Column({ type: "text", nullable: true })
  portfolio: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
