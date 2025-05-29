import { User } from "../entities/user.entity";

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  image: string | null;
  roles: string[];
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.image = user.image;
    this.roles = user.roles.map((role) => role.name);
    this.createdAt = user.createdAt;
  }
}
