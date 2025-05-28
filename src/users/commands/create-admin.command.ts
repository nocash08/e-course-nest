import { Command, CommandRunner } from "nest-commander";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { RoleType } from "../enum/role-type.enum";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import * as readline from "readline";

@Injectable()
@Command({ name: "create:admin", description: "Create an admin user" })
export class CreateAdminCommand extends CommandRunner {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  private async confirm(message: string): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(`${message} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "y");
      });
    });
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    try {
      const adminEmail = this.configService.get<string>("ADMIN_EMAIL");
      const adminPassword = this.configService.get<string>("ADMIN_PASSWORD");
      const adminName = this.configService.get<string>("ADMIN_NAME");

      if (!adminEmail || !adminPassword || !adminName) {
        console.error(
          "Admin credentials not found in environment variables. Please check your .env file.",
        );
        return;
      }

      // Check if admin already exists
      const adminExists = await this.userRepository.findOne({
        where: { email: adminEmail },
      });

      if (adminExists) {
        console.log("Admin user already exists!");
        return;
      }

      console.log(`About to create admin user with email: ${adminEmail}`);
      const shouldContinue = await this.confirm("Do you want to continue?");

      if (!shouldContinue) {
        console.log("Admin creation cancelled.");
        return;
      }

      // Ensure admin role exists
      let adminRole = await this.roleRepository.findOne({
        where: { name: RoleType.ADMIN },
      });

      if (!adminRole) {
        adminRole = this.roleRepository.create({
          name: RoleType.ADMIN,
        });
        await this.roleRepository.save(adminRole);
      }

      // Create admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminUser = this.userRepository.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        roles: [adminRole],
      });

      await this.userRepository.save(adminUser);

      console.log("Admin user created successfully!");
      console.log("Email:", adminEmail);
      console.log(
        "Please check your .env file for the password or change it after first login.",
      );
    } catch (error) {
      console.error("Failed to create admin user:", error.message);
    }
  }
}
