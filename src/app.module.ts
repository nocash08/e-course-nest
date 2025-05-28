import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/user.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { typeOrmConfig } from "./common/config/database.config"; // Sesuaikan path dengan lokasi file config Anda
import { CommandsModule } from "./users/commands/commands.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseConfig =
          configService.get<TypeOrmModuleOptions>("database");
        if (!databaseConfig) {
          throw new Error("Database configuration not found");
        }
        return databaseConfig;
      },
    }),
    UsersModule,
    CommandsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
