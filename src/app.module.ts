import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [UsersModule, AuthModule, ProductModule, ReviewModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
