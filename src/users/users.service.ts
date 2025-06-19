import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schma';

@Injectable()
export class UsersService {
    constructor(
        private readonly AuthService: AuthService,
        @InjectModel(User.name) private readonly UserModel: Model<User>,
    ){}

    async createUser(createUserDto: CreateUserDto): Promise<boolean> {
        const hashedPassword = await this.AuthService.hashPassword(createUserDto.password);
        const user = new this.UserModel({
            ...createUserDto,
            password: hashedPassword,
        });
        await user.save();
        return true;
    }

    async getUserById(userId: string): Promise<UserDocument | null> {
        return this.UserModel.findById(userId);
    }

    async updateUser(updateUser: UpdateUserDto, userId: string): Promise<boolean> {
    
        const user = await this.UserModel.findByIdAndUpdate(userId, updateUser, {
            new: true,
            runValidators: true,
        });
    
        if (!user) {
            throw new NotFoundException('Usuario no encontrado o no actualizado');
        }
    
        return true;
    }
    
    async deleteUser(token: string): Promise<boolean> {
        const decodedToken = await this.AuthService.verifyToken(token);
        const id = decodedToken._id;
    
        const result = await this.UserModel.findByIdAndDelete(id);
    
        if (!result) {
            throw new NotFoundException('El usuario no fue encontrado o ya fue eliminado');
        }
    
        return true;
    }
    
}
