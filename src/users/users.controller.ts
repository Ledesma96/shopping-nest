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
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schema/user.schma';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post('/create-user')
    async createUser(
        @Body() newUser: CreateUserDto
    ): Promise<{ success: boolean; message: string }> {
    try {
        await this.userService.createUser(newUser);
        return { success: true, message: 'User created successfully' };
    } catch (error) {
        console.error('Create User Error:', error);

        if (error.code === 11000 && error.keyPattern?.email) {
            throw new BadRequestException('Email already registered.');
        }

        if (error instanceof BadRequestException) {
            throw new BadRequestException(error.message);
        }

        throw new InternalServerErrorException('Failed to create user.');
    }
}


    @Get()
    async getUserById(
        @Query('id') id: string
    ): Promise<UserDocument> {
        
        try {
            const user = await this.userService.getUserById(id);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            console.error('Get User Error:', error);

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve user.');
        }
    }

    @Put('/update-user/:id')
    @UseGuards(JwtAuthGuard)
    async updateUser(
        @Req() req,
        @Param('id') id: string,
        @Body() data: UpdateUserDto
    ): Promise<{ success: boolean; message: string }> {
        try {
            const userId = req.user._id;
            if(userId != id) {
                throw new ForbiddenException('You can only update your own account.');
            }
            await this.userService.updateUser(data, userId);
            return { success: true, message: 'User updated successfully' };
        } catch (error) {
            console.error('Update User Error:', error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }

            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }

            throw new InternalServerErrorException('Failed to update user.');
        }
    }

    @Delete('/delete-user/:id')
    @UseGuards(JwtAuthGuard)
    async deleteUser(
        @Req() req,
        @Param('id') id:string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const userId = req.user._id;
            if(userId != id){
                throw new ForbiddenException('You can only update your own account.');
            }
            await this.userService.deleteUser(userId);
            return { success: true, message: 'User deleted successfully' };
        } catch (error) {
            console.error('Delete User Error:', error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw new InternalServerErrorException('Failed to delete user.');
        }
    }

    @Post('/login')
    async login(@Body() data: LoginDto): Promise<{ token: string }> {
        try {
            return await this.userService.login(data);
        } catch (error) {
            console.error('Login Error:', error);

            if (error instanceof NotFoundException) {
                throw new UnauthorizedException(error.message);
            }

            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }

            throw new InternalServerErrorException('Login failed.');
        }
    }
}
