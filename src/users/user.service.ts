import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import * as bcrypt from "bcrypt";
import { RegisterDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { ResponseDto } from "../common/dto/response.dto";
import { RoleType } from "./enum/role-type.enum";
import { isValidUUID } from "../utils/uuid-validation.util";
import { deleteFile } from "../utils/file.util";
import { BecomeSellerDto } from "./dto/become-seller.dto";
import { SellerProfile } from "./entities/seller-profile.entity";
import { SellerProfileResponseDto } from "./dto/seller-profile-response.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(SellerProfile)
    private sellerProfileRepository: Repository<SellerProfile>,
    private jwtService: JwtService,
  ) {}

  async getAllUsers(
    paginationDto: PaginationDto,
  ): Promise<ResponseDto<UserResponseDto[]>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const [users, total] = await this.userRepository.findAndCount({
        skip,
        take: limit,
        order: {
          createdAt: "DESC",
        },
        relations: ["roles"],
      });

      if (users.length === 0 && page !== 1) {
        throw new NotFoundException("No users found for this page");
      }

      const totalPages = Math.ceil(total / limit);
      const userResponses = users.map((user) => new UserResponseDto(user));

      return new ResponseDto(
        200,
        "Users retrieved successfully",
        userResponses,
        {
          page,
          limit,
          totalItems: total,
          totalPages,
        },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error("Failed to fetch users");
    }
  }

  async getUserById(id: string): Promise<ResponseDto<UserResponseDto>> {
    try {
      if (!id) {
        throw new BadRequestException("ID is required");
      }

      if (!isValidUUID(id)) {
        throw new BadRequestException("Invalid ID format");
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ["roles"],
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return new ResponseDto(
        200,
        "User retrieved successfully",
        new UserResponseDto(user),
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error("Failed to retrieve user: " + error.message);
    }
  }

  async registerUser(
    registerDto: RegisterDto,
  ): Promise<ResponseDto<{ id: string }>> {
    try {
      await this.ensureRolesExist();

      const existingUser = await this.userRepository.findOneBy({
        email: registerDto.email,
      });
      if (existingUser) {
        throw new ConflictException("Email already exists");
      }

      // Get BUYER role
      const buyerRole = await this.roleRepository.findOne({
        where: { name: RoleType.BUYER },
      });

      if (!buyerRole) {
        throw new NotFoundException(
          "Default buyer role not found. Please check system configuration.",
        );
      }

      const newUser = this.userRepository.create({
        ...registerDto,
        password: await bcrypt.hash(registerDto.password, 10),
        roles: [buyerRole],
      });

      const savedUser = await this.userRepository.save(newUser);

      return new ResponseDto(201, "User created successfully", {
        id: savedUser.id,
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error("Failed to register user: " + error.message);
    }
  }

  async loginUser(
    loginDto: LoginDto,
  ): Promise<ResponseDto<{ access_token: string }>> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
        relations: ["roles"],
      });

      if (!user) {
        throw new UnauthorizedException("Invalid email or password");
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid email or password");
      }

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((role) => role.name),
        image: user.image,
      };

      const access_token = await this.jwtService.signAsync(payload);

      return new ResponseDto(200, "Login successful", { access_token });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error("Login failed: " + error.message);
    }
  }

  async deleteUser(id: string): Promise<ResponseDto<null>> {
    try {
      if (!id) {
        throw new BadRequestException("ID is required");
      }

      if (!isValidUUID(id)) {
        throw new BadRequestException("Invalid ID format");
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ["roles"],
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      await this.userRepository.remove(user);

      return new ResponseDto(200, "User deleted successfully");
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error("Failed to delete user: " + error.message);
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<null>> {
    try {
      if (!id) {
        throw new BadRequestException("ID is required");
      }

      if (!isValidUUID(id)) {
        throw new BadRequestException("Invalid ID format");
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ["roles"],
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOneBy({
          email: updateUserDto.email,
        });

        if (existingUser) {
          throw new ConflictException("Email already exists");
        }
      }

      if (updateUserDto.image && user.image) {
        deleteFile(user.image);
      }

      if (updateUserDto.image) {
        updateUserDto.image = `image-profile/${updateUserDto.image}`;
      }

      Object.assign(user, updateUserDto);
      await this.userRepository.save(user);

      return new ResponseDto(200, "User updated successfully");
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error("Failed to update user: " + error.message);
    }
  }

  async applyAsSeller(
    userId: string,
    becomeSellerDto: BecomeSellerDto,
  ): Promise<ResponseDto<null>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ["roles"],
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (user.roles.some((role) => role.name === RoleType.SELLER)) {
        throw new ConflictException("User is already a seller");
      }

      const sellerRole = await this.roleRepository.findOne({
        where: { name: RoleType.SELLER },
      });

      if (!sellerRole) {
        throw new NotFoundException("Seller role not found in system");
      }

      const sellerProfile = this.sellerProfileRepository.create({
        ...becomeSellerDto,
        user,
      });

      user.roles = [...user.roles, sellerRole];

      await Promise.all([
        this.sellerProfileRepository.save(sellerProfile),
        this.userRepository.save(user),
      ]);

      return new ResponseDto(201, "Successfully registered as a seller");
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error("Failed to register as seller: " + error.message);
    }
  }

  async getSellerProfile(
    userId: string,
  ): Promise<ResponseDto<SellerProfileResponseDto | null>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ["roles"],
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const isSeller = user.roles.some((role) => role.name === RoleType.SELLER);
      if (!isSeller) {
        return new ResponseDto(200, "User is not a seller", null);
      }

      const sellerProfile = await this.sellerProfileRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!sellerProfile) {
        throw new NotFoundException("Seller profile not found");
      }

      return new ResponseDto(
        200,
        "Seller profile retrieved successfully",
        new SellerProfileResponseDto(sellerProfile),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error("Failed to get seller profile: " + error.message);
    }
  }

  private async ensureRolesExist(): Promise<void> {
    try {
      const existingRoles = await this.roleRepository.find();
      const existingRoleNames = existingRoles.map((role) => role.name);

      const rolesToCreate = Object.values(RoleType)
        .filter((roleName) => !existingRoleNames.includes(roleName))
        .map((roleName) => {
          const role = this.roleRepository.create();
          role.name = roleName;
          return role;
        });

      if (rolesToCreate.length > 0) {
        await this.roleRepository.save(rolesToCreate);
      }
    } catch (error) {
      throw new Error("Failed to ensure roles exist: " + error.message);
    }
  }
}
