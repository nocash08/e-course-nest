import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class BecomeSellerDto {
  @IsNotEmpty()
  @IsString()
  shopName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
