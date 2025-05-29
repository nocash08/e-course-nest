import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./user.controller";
import { UsersService } from "./user.service";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { SellerProfile } from "./entities/seller-profile.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, SellerProfile]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
