import { IsOptional, IsString } from "class-validator";
export class UpdateAddressDTO {

    @IsString()
    _id: string

    @IsString()
    @IsOptional()
    addressType: string;
    
    @IsString()
    @IsOptional()
    street: string;
    
    @IsString()
    @IsOptional()
    city: string;
    
    @IsString()
    @IsOptional()
    cp: string;
}