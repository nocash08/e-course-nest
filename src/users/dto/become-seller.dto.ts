import {
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsOptional,
} from "class-validator";

export class BecomeSellerDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  expertise: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
