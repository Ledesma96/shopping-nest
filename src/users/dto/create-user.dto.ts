import { IsEmail, IsEnum, IsNumber, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../schema/user.schema';


export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsNumber()
    phone: number;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
