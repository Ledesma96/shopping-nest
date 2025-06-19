import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schema/user.schma';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ) {}

    @Post()
    async createUser(
        @Body() newUser: CreateUserDto
    ): Promise<{ success: boolean; message: string }> {
        try {
        const created = await this.userService.createUser(newUser);

        if (!created) {
            throw new HttpException("User couldn't be created", HttpStatus.BAD_REQUEST);
        }

        return { success: true, message: 'User created successfully' };
        } catch (error) {
        throw new HttpException(
            error.message || 'Internal Server Error',
            error.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
        }
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUserById(
        @Req() req,
    ) : Promise <UserDocument>
    {
        try {
            const userId = req.token._id;
            const user = await this.userService.getUserById(userId);
            if(!user){
                throw new HttpException(
                    "User not find",
                    HttpStatus.NOT_FOUND
                )
            }
            return user
        } catch (error) {
            throw new HttpException(
                error.message || 'Internal Server Error',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Put('/update-user/')
    @UseGuards(JwtAuthGuard)
    async updateUser(
        @Req() req,
        @Body() data: UpdateUserDto,
    ): Promise<boolean>
    {
        try {
            const userId = req.token._id;
            const updateUser = await this.userService.updateUser(data, userId)
            if(!updateUser){
                throw new HttpException(
                    'User not found or not update',
                    HttpStatus.BAD_REQUEST
                )
            }
            return true
        } catch (error) {
            throw new HttpException(
                error.message || 'Internal Server Error',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Delete('/delete-user')
    @UseGuards(JwtAuthGuard)
    async deleteUser(
        @Req() req
    ): Promise <Boolean>
    {
        try {
            const userId = req.token._id;
            const userDeleted = await this.userService.deleteUser(userId);
            if(!userDeleted){
                throw new HttpException(
                    'User not found or not deleted',
                    HttpStatus.BAD_REQUEST
                )
            }
            return true
        } catch (error) {
            throw new HttpException(
                error.message || 'Internal Server Error',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
