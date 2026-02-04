import { Exclude, Expose } from 'class-transformer';

export class UserDto {
    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    favorites: string[]; // o Types.ObjectId[] si querés tipar MongoId

    @Expose()
    avatarUrl?: string;

    @Expose()
    verified: boolean;

    @Expose()
    isActive: boolean;

    @Expose()
    cart: string; // o Types.ObjectId

    @Expose()
    permissions: string[];

    @Expose()
    superAdminNote?: string;

    // Excluimos explícitamente lo que no queremos
    @Exclude()
    _id: string;

    @Exclude()
    password: string;

    @Exclude()
    role: string;
}
