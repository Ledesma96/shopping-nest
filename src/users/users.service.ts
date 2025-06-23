import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { MailerService } from 'src/mailer/mailer.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schma';

@Injectable()
export class UsersService {
    constructor(
        private readonly AuthService: AuthService,
        @InjectModel(User.name) private readonly UserModel: Model<User>,
        private readonly mailerService: MailerService
    ){}

    async createUser(createUserDto: CreateUserDto): Promise<boolean> {
        const hashedPassword = await this.AuthService.hashPassword(createUserDto.password);
        const user = new this.UserModel({
            ...createUserDto,
            password: hashedPassword,
        });
        await user.save();
        const email = user.email;
        const userId = user._id
        const url = await this.mailerService.sendVerifyMail(email, userId.toString());
        console.log(url);
        
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
    
    // user.service.ts
    async login(data: LoginDto): Promise<{ token: string, message: string }> {
        const user = await this.UserModel.findOne({ email: data.email }) as UserDocument;
    
        if (!user) throw new NotFoundException('User not found');
    
        const verifyPassword = await this.AuthService.comparePasswords(data.password, user.password);
    
        if (!verifyPassword) throw new NotFoundException('Password incorrect');
    
        const _id = user._id.toString();
        const token = await this.AuthService.generateToken({ _id, role: user.role });
    
        return { token, message: 'Login successful' };
    }

    async toggleFavorite(productId: string, userId: string): Promise<{ added: boolean }> {
        const user = await this.UserModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        
        const productObjectId = new Types.ObjectId(productId);
        
        const index = user.favorites.findIndex(fav => fav.equals(productObjectId));
        
        if (index !== -1) {
            user.favorites.splice(index, 1);
            await user.save();
            return { added: false };
        } else {
            user.favorites.push(productObjectId);
            await user.save();
            return { added: true };
        }
    }
}
