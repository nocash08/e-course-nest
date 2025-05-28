import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { CreateAdminCommand } from "./create-admin.command";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), ConfigModule],
  providers: [CreateAdminCommand],
})
export class CommandsModule {}
