import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';

@Module({
  imports:[
    MongooseModule.forFeature([{
      name: User.name, schema: UserSchema
    }]),
    AuthModule
  ],
  providers: [MailerService],
  exports: [MailerService],
  controllers: [MailerController]
})
export class MailerModule {}
