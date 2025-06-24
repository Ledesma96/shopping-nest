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
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schema/user.schema';
import { UsersService } from './users.service';

@Controller('users')
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

    @Get()
    async getUserById(@Query('id') id: string): Promise<UserDocument> {
        return await this.usersService.getUserById(id);
    }

    @Put('/update-user/:id')
    @UseGuards(JwtAuthGuard)
    async updateUser(
        @Req() req,
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<{ success: boolean; message: string }> {
        const userId = req.user._id;
        if (userId !== id) throw new ForbiddenException('You can only update your own account.');

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
            const { token, message } = await this.usersService.login(loginDto);

            res.cookie('token', token, {
                httpOnly: true,
                secure: false, // Cambiar a true en producción (HTTPS)
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
            });

            res.status(200).json({ message });
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

    @Post('/add-to-favorites')
    @UseGuards(JwtAuthGuard)
    async toggleFavorite(@Query('productId') productId: string, @Req() req): Promise<{ added: boolean }> {
        return await this.usersService.toggleFavorite(productId, req.user._id);
    }
}