import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { UsersModule } from './users/users.module';
import { CartModule } from './cart/cart.module';
import { MailerModule } from './mailer/mailer.module';
import { DmsModule } from './dms/dms.module';
import { GatewayModule } from './socket/gateway.module';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    UsersModule,
    AuthModule,
    ProductModule,
    ReviewModule,
    CartModule,
    MailerModule,
    DmsModule,
    GatewayModule,
    AddressModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
