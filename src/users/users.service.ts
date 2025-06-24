import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { MailerService } from 'src/mailer/mailer.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UsersService {
    constructor(
        private readonly authService: AuthService,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly mailerService: MailerService,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<boolean> {
        const hashedPassword = await this.authService.hashPassword(createUserDto.password);
        const user = new this.userModel({ ...createUserDto, password: hashedPassword });
        await user.save();

        await this.mailerService.sendVerifyMail(user.email, user._id.toString());
        return true;
    }

    async getUserById(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
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

    async login(loginDto: LoginDto): Promise<{ token: string; message: string }> {
        const user = await this.userModel.findOne({ email: loginDto.email });
        if (!user) throw new NotFoundException('User not found');

        const isPasswordValid = await this.authService.comparePasswords(loginDto.password, user.password);
        if (!isPasswordValid) throw new NotFoundException('Password incorrect');

        const token = await this.authService.generateToken({ _id: user._id.toString(), role: user.role });
        return { token, message: 'Login successful' };
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
}