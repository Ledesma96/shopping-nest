import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAddressDto {
    @IsString()
    @IsNotEmpty()
    addressType: string; // Ej: "Casa", "Trabajo"

    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    cp: string;
}