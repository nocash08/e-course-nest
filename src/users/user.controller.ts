import {
  Controller,
  Body,
  Get,
  Post,
  UseGuards,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  Put,
  Delete,
  HttpCode,
  UploadedFile,
  Query,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./user.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { ResponseDto } from "../common/dto/response.dto";
import { multerOptions } from "../common/config/multer.config";
import { BecomeSellerDto } from "./dto/become-seller.dto";
import { SellerProfileResponseDto } from "./dto/seller-profile-response.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AuthenticatedRequest } from "./interfaces/authenticated-request.interface";

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("/users")
  @HttpCode(HttpStatus.OK)
  async getAllUsers(
    @Query() paginationDto: PaginationDto,
  ): Promise<ResponseDto<UserResponseDto[]>> {
    return this.usersService.getAllUsers(paginationDto);
  }

  @Get("/user/:id")
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Param("id") id: string,
  ): Promise<ResponseDto<UserResponseDto>> {
    return this.usersService.getUserById(id);
  }

  @Post("/auth/register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseDto<{ id: string }>> {
    return this.usersService.registerUser({
      ...registerDto,
    });
  }

  @Post("/auth/login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ResponseDto<{ access_token: string }>> {
    return this.usersService.loginUser(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put("/user/:id")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("image", multerOptions("image-profile")))
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseDto<null>> {
    return this.usersService.updateUser(id, {
      ...updateUserDto,
      image: file?.filename,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/user/:id")
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param("id") id: string): Promise<ResponseDto<null>> {
    return this.usersService.deleteUser(id);
  }

  @Get("/seller/:id/profile")
  @UseGuards()
  @HttpCode(HttpStatus.OK)
  async getSellerProfile(
    @Param("id") id: string,
  ): Promise<ResponseDto<SellerProfileResponseDto | null>> {
    return this.usersService.getSellerProfile(id);
  }

  @Post("/seller/apply")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async applyAsSeller(
    @Req() req: AuthenticatedRequest,
    @Body() becomeSellerDto: BecomeSellerDto,
  ): Promise<ResponseDto<null>> {
    return this.usersService.applyAsSeller(req.user.id, becomeSellerDto);
  }
}
