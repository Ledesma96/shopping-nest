import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { AddressDto } from './dto/address-user.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';

@Controller('api/v1/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('/create-user')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<{ success: boolean; message: string }> {
        try {
            await this.usersService.createUser(createUserDto);
            return { success: true, message: 'User created successfully' };
        } catch (error) {
            if (error.code === 11000 && error.keyPattern?.email) {
                throw new BadRequestException('Email already registered.');
            }
            throw new InternalServerErrorException('Failed to create user.');
        }
    }

    @Get('/get-favorites')
    @UseGuards(JwtAuthGuard)
    async getFavorites(@Req() req): Promise <{favorites: any}>{
        console.log(req.user._id, 'controller');
        
        const favorites = await this.usersService.getFavorites(req.user._id)
        return favorites
    }

    @Get('/me')
    @UseGuards(JwtAuthGuard)
    async getUserById(
        @Req() req: any
    ): Promise<UserDto> {
        const id = req.user._id
        console.log(id)
        return await this.usersService.getUserById(id);
    }

    @Get('/:id')
    async getUserProfile(@Param('id') id: string): Promise<UserDto> {
        const user = await this.usersService.getUserById(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    @Put('/update-user')
    @UseGuards(JwtAuthGuard)
    async updateUser(
        @Req() req,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<{ success: boolean; message: string }> {
        const userId = req.user._id;

        await this.usersService.updateUser(userId, updateUserDto);
        return { success: true, message: 'User updated successfully' };
    }

    @Delete('/delete-user/:id')
    @UseGuards(JwtAuthGuard)
    async deleteUser(@Req() req, @Param('id') id: string): Promise<{ success: boolean; message: string }> {
        const userId = req.user._id;
        if (userId !== id) throw new ForbiddenException('You can only delete your own account.');

        await this.usersService.deleteUser(userId);
        return { success: true, message: 'User deleted successfully' };
    }

    @Post('/login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
        try {
            const { token, message, user } = await this.usersService.login(loginDto);

            res.cookie('token', token, {
                httpOnly: true,
                secure: false, // Cambiar a true en producción (HTTPS)
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
            });

            res.status(200).json({ message, user });
        } catch (error) {
            if (error instanceof NotFoundException) {
                res.status(401).json({ message: error.message });
            } else if (error instanceof BadRequestException) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Login failed.' });
            }
        }
    }

    @Post('/logout')
    logout(@Res() res: Response): void {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });

        res.status(200).json({ message: 'Logout successful', success: true });
    }


    @Post('/add-to-favorites')
    @UseGuards(JwtAuthGuard)
    async toggleFavorite(@Query('productId') productId: string, @Req() req): Promise<{ added: boolean }> {
        return await this.usersService.toggleFavorite(productId, req.user._id);
    }

    @Post('/add-address')
    @UseGuards(JwtAuthGuard)
    async addAddress(
        @Body() address: CreateAddressDto,
        @Req() req: any
    ): Promise<{ success: boolean, user: UserDto }> {
        // req.user._id viene del JwtStrategy
        return await this.usersService.addAddress(req.user._id, address);
    }

    @Put('/update-address/:addressId')
    @UseGuards(JwtAuthGuard)
    async updateAddress(
        @Body() dataAddress: UpdateAddressDto, // Usamos el DTO de update que incluye el _id
        @Param('addressId') addressId: string,
        @Req() req: any
    ): Promise<{ success: boolean, user: UserDto }> {
        return await this.usersService.updateAddress(req.user._id, dataAddress, addressId);
    }

    @Delete('/delete-address/:addressId') 
    @UseGuards(JwtAuthGuard)
    async deleteAddress(
        @Param('addressId') addressId: string, 
        @Req() req: any
    ): Promise<{ success: boolean, user: UserDto }> {
        return await this.usersService.deleteAddress(addressId, req.user._id);
    }
    
}