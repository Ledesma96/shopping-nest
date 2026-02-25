import { Expose, Transform } from "class-transformer";
import { IsString } from "class-validator";

export class AddressDto {
  @Expose()
  @IsString()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  @IsString()
  addressType: string;

  @Expose()
  @IsString()
  street: string;

  @Expose()
  @IsString()
  city: string;

  @Expose()
  @IsString()
  cp: string;
}
