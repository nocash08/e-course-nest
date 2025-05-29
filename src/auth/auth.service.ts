import { Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Role } from "../users/entities/role.entity";
import { RoleType } from "../users/enum/role-type.enum";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async findOrCreateOAuthUser(oauthData: any): Promise<User> {
    try {
      let user = await this.userRepository.findOne({
        where: { email: oauthData.email },
        relations: ["roles"],
      });

      if (!user) {
        const buyerRole = await this.roleRepository.findOne({
          where: { name: RoleType.BUYER },
        });

        if (!buyerRole) {
          throw new NotFoundException("Default buyer role not found");
        }

        user = this.userRepository.create({
          email: oauthData.email,
          name: `${oauthData.firstName} ${oauthData.lastName}`.trim(),
          image: oauthData.picture,
          password: await bcrypt.hash(Math.random().toString(36), 10),
          roles: [buyerRole],
        });

        await this.userRepository.save(user);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error("Failed to process OAuth user: " + error.message);
    }
  }

  async createOAuthToken(user: User): Promise<string> {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      image: user.image,
    };

    return this.jwtService.signAsync(payload);
  }
}
