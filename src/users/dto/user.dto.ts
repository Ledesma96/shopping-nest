import { Exclude, Expose, Type} from 'class-transformer';
import { AddressDto } from './address-user.dto';


export class UserDto {
    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    phone: number;

    @Expose()
    @Type(() => AddressDto) 
    address: AddressDto[];

    @Expose()
    favorites: string[];

    @Expose()
    avatarUrl?: string;

    @Expose()
    verified: boolean;

    @Expose()
    isActive: boolean;

    @Expose()
    cart: string;

    @Expose()
    permissions: string[];

    @Expose()
    superAdminNote?: string;

    // Excluimos el ID del usuario como pediste
    @Exclude()
    _id: string;

    @Exclude()
    password: string;

    @Exclude()
    role: string;
}