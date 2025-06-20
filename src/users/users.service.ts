import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
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

    async getUserById(_id: string): Promise<UserDocument | null> {
        return this.UserModel.findById(_id);
    }

    async updateUser(updateUser: UpdateUserDto, userId: string): Promise<boolean> {
    
        const user = await this.UserModel.findByIdAndUpdate(userId, updateUser, {
            new: true,
            runValidators: true,
        });
    
        if (!user) {
            throw new NotFoundException('user not find or not updated');
        }
    
        return true;
    }
    
    async deleteUser(id: string): Promise<boolean> {
        const result = await this.UserModel.findByIdAndDelete(id);
    
        if (!result) {
            throw new NotFoundException('User not find');
        }
    
        return true;
    }
    
    async login(data: LoginDto): Promise<{ token: string }> {
        const user = await this.UserModel.findOne({email: data.email}) as UserDocument;
            
        if(!user){
            throw new NotFoundException('User not find');
        }
        const verifyPassword = await this.AuthService.comparePasswords(data.password, user.password);
            
        if(!verifyPassword){
            throw new NotFoundException('Password incorrect')
        }

        const _id = user._id.toString();
        const token = await this.AuthService.generateToken({_id, role: user.role})
        return {token}
    }
}
