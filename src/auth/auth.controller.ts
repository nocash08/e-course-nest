import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { ResponseDto } from "../common/dto/response.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(
    @Req() req: Request,
  ): Promise<ResponseDto<{ access_token: string }>> {
    const oauthUser = req.user;
    const user = await this.authService.findOrCreateOAuthUser(oauthUser);
    const access_token = await this.authService.createOAuthToken(user);

    return new ResponseDto(200, "Google authentication successful", {
      access_token,
    });
  }
}
