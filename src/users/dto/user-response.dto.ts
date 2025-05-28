import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";

export class UserResponseDto {
  uuid: string;
  name: string;
  email: string;
  roles: string[];
  image: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User) {
    this.uuid = user.uuid;
    this.name = user.name;
    this.email = user.email;
    this.roles = user.roles?.map((role) => role.name) || [];
    this.image = user.image;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
