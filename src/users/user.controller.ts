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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./user.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthGuard } from "./guard/auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { ResponseDto } from "../common/dto/response.dto";
import { multerOptions } from "../common/config/multer.config";

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

  @Get("/user/:uuid")
  @HttpCode(HttpStatus.OK)
  async getUserByUuid(
    @Param("uuid") uuid: string,
  ): Promise<ResponseDto<UserResponseDto>> {
    return this.usersService.getUserByUuid(uuid);
  }

  @Post("/auth/register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseDto<{ uuid: string }>> {
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

  @UseGuards(AuthGuard)
  @Put("/user/:uuid")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("image", multerOptions("image-profile")))
  async update(
    @Param("uuid") uuid: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseDto<null>> {
    return this.usersService.updateUser(uuid, {
      ...updateUserDto,
      image: file?.filename,
    });
  }

  @UseGuards(AuthGuard)
  @Delete("/user/:uuid")
  @HttpCode(HttpStatus.OK)
  async delete(@Param("uuid") uuid: string): Promise<ResponseDto<null>> {
    return this.usersService.deleteUser(uuid);
  }
}
