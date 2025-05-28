import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsOptional,
  IsEmail,
} from "class-validator";

export class RegisterDto {
  @IsNotEmpty({ message: "Name cannot be empty" })
  @IsString({ message: "Name must be a string" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(50, { message: "Name cannot be longer than 50 characters" })
  @Matches(/^[a-zA-Z ]*$/, {
    message: "Name can only contain letters and spaces",
  })
  name: string;

  @IsNotEmpty({ message: "Email cannot be empty" })
  @IsString({ message: "Email must be a string" })
  @IsEmail({}, { message: "Invalid email format" })
  @MaxLength(50, { message: "Email cannot be longer than 50 characters" })
  email: string;

  @MinLength(8)
  @IsNotEmpty()
  @Matches(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  @Matches(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  @Matches(/[0-9]/, {
    message: "Password must contain at least one number",
  })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: "Password must contain at least one special character",
  })
  password: string;
}
