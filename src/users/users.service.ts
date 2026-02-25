import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Model, ObjectId, Types } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { MailerService } from 'src/mailer/mailer.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './schema/user.schema';
import { AddressService } from 'src/address/address.service';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly authService: AuthService,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly mailerService: MailerService,
        private readonly addressService: AddressService
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<boolean> {
        const hashedPassword = await this.authService.hashPassword(createUserDto.password);
        const user = new this.userModel({ ...createUserDto, password: hashedPassword });
        await user.save();

        await this.mailerService.sendVerifyMail(user.email.toLowerCase(), user._id.toString());
        return true;
    }

    async getFavorites(id: ObjectId): Promise<{ favorites: any }> {
        const user = await this.userModel
            .findById(id)
            .select('favorites')
            .populate('favorites')
            .lean()

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return { favorites: user.favorites };
    }

    async getUserById(id: string): Promise<UserDto> {
        const user = await this.userModel.findById(id)
        .populate('address')
        .lean();
        if (!user) throw new NotFoundException('User not found');

        const userDto = plainToInstance(UserDto, user, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
        
        return userDto
    }
    

    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<boolean> {
        
        const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, {
            new: true,
            runValidators: true,
        });

        if (!user) throw new NotFoundException('User not found or not updated');
        return true;
    }

    async deleteUser(userId: string): Promise<boolean> {
        const result = await this.userModel.findByIdAndDelete(userId);
        
        if (!result) throw new NotFoundException('User not found');
        return true;
    }

    async login(loginDto: LoginDto): Promise<{ token: string; message: string, user: UserDto }> {
        const user = await this.userModel.findOne({ email: loginDto.email.toLowerCase() });
        if (!user) throw new NotFoundException('User not found');

        const isPasswordValid = await this.authService.comparePasswords(loginDto.password, user.password);
        if (!isPasswordValid) throw new NotFoundException('Password incorrect');

        const token = await this.authService.generateToken({ _id: user._id.toString(), role: user.role });

        const userDto = plainToInstance(UserDto, user.toObject(), {
            excludeExtraneousValues: true
        })
        
        return { token, message: 'Login successful', user: userDto };
    }

    async toggleFavorite(productId: string, userId: string): Promise<{ added: boolean }> {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const productObjectId = new Types.ObjectId(productId);
        const isFavorite = user.favorites.some(fav => fav.equals(productObjectId));

        if (isFavorite) {
            user.favorites = user.favorites.filter(fav => !fav.equals(productObjectId));
            await user.save();
            return { added: false };
        } else {
            user.favorites.push(productObjectId);
            await user.save();
            return { added: true };
        }
    }

    async addAddress(userId: string, addressDto: CreateAddressDto): Promise<{success: boolean, user: UserDto}> {
        const newAddress = await this.addressService.createAddress(addressDto);

            try {
                const user = await this.userModel.findByIdAndUpdate(
                    userId,
                    { $push: { address: newAddress._id } },
                    { new: true }
                ).populate('address').lean();

                if (!user) {
                    throw new NotFoundException('User not found');
                }

                const userDto = plainToInstance(UserDto, user,
                    {
                        excludeExtraneousValues: true,
                        enableImplicitConversion: true
                    }
                );

                return {success: true, user: userDto}

            } catch (error) {
                await this.addressService.deleteAddress(newAddress._id.toString());
                throw error;
            }
        }

    async updateAddress(
        userId: string, 
        dataAddress: UpdateAddressDto,
        addressId: string
    ): Promise<{ success: boolean, user: UserDto }> {

        if (!addressId) {
            throw new BadRequestException('Address ID is required for update');
        }

        // 1. Delegamos la actualización al AddressService
        // Esto actualiza el documento en la colección 'address'
        const updatedAddr = await this.addressService.updateAddress(addressId, dataAddress);

        if (!updatedAddr) {
            throw new NotFoundException('Address not found in database');
        }

        // 2. Buscamos al usuario para devolverlo actualizado
        // No necesitamos hacer "save()" en el user porque el ID en su array no cambió
        const user = await this.userModel
            .findById(userId)
            .populate('address') // 🔥 Fundamental para traer la data nueva
            .lean();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 3. Verificamos que esa dirección realmente le pertenezca a ese usuario
        // (Seguridad extra para que un usuario no edite direcciones de otros)
        const ownsAddress = user.address.some(addr => addr._id.toString() === addressId);
        if (!ownsAddress) {
            throw new ForbiddenException('This address does not belong to the user');
        }

        const userDto = plainToInstance(UserDto, user, {
            excludeExtraneousValues: true,
        });

        return { success: true, user: userDto };
    }

    async deleteAddress(addressId: string, userId: string): Promise<{ success: boolean, user: UserDto }> {
        // 1. Borramos la dirección físicamente de su colección
        // Usamos el servicio especializado para mantener la lógica encapsulada
        const deleted = await this.addressService.deleteAddress(addressId);

        if (!deleted) {
            throw new NotFoundException('Address not found in database');
        }

        // 2. Quitamos la referencia (el ID) del array 'address' del usuario
        // Usamos findByIdAndUpdate con $pull para hacerlo en una sola operación atómica
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            { $pull: { address: addressId } },
            { new: true }
        )
        .populate('address') // Traemos las direcciones restantes para el DTO
        .lean();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 3. Transformamos a DTO para enviar al Frontend
        const userDto = plainToInstance(UserDto, user, {
            excludeExtraneousValues: true,
        });

        return { success: true, user: userDto };
    }

}