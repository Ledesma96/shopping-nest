import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/schema/user.schma';
import { verifyMail } from './config/mailer.config';

@Injectable()
export class MailerService {
    constructor(
        private readonly authService: AuthService,
        @InjectModel(User.name) private readonly UserModel: Model<User>
    ){
    }
    async sendVerifyMail(email: string, userId: string): Promise<any>{
        const payload = {
            userId,
            email
        }
        const generateToken = await this.authService.generateTokenVerifyMail(payload);
        const url = `https://127.0.0.1:3000/${generateToken}`;
        const data = {
            email,
            url
        }
        
        const sendMail = verifyMail(data);
        return url
    }

    async verifyMail(token: string): Promise<boolean>{
        const verify = await this.authService.verifyTokenVerifyMail(token);
        console.log(verify);
        
        if(verify){
            const _id = verify.payload.userId;
            console.log(_id);
            
            await this.UserModel.findOneAndUpdate({_id: new Types.ObjectId(_id)}, {verified: true})
            return true
        }
    }
}
