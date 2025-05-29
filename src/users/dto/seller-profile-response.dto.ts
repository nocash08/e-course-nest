import { SellerProfile } from "../entities/seller-profile.entity";

export class SellerProfileResponseDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  expertise: string;
  portfolio: string | null;
  description: string | null;
  createdAt: Date;

  constructor(profile: SellerProfile) {
    this.id = profile.id;
    this.fullName = profile.fullName;
    this.phoneNumber = profile.phoneNumber;
    this.address = profile.address;
    this.expertise = profile.expertise;
    this.portfolio = profile.portfolio;
    this.description = profile.description;
    this.createdAt = profile.createdAt;
  }
}
