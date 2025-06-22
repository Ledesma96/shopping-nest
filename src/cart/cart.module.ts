import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart, CartSchema } from './schema/cart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Cart.name, schema: CartSchema
    }]),
    AuthModule
  ],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule {}
