import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, addresSchema } from './schema/address.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
        {
          name: Address.name,
          schema: addresSchema
        }
      ]),],
  providers: [AddressService],
  exports: [AddressService]
})
export class AddressModule {}
