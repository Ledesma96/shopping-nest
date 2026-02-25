import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Address } from './schema/address.schema';
import { Model } from 'mongoose';
import { UpdateAddressDTO } from 'src/users/dto/update-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
    constructor(
        @InjectModel(Address.name) private readonly addressModel: Model<Address>        
    ){}

    async createAddress(addressDto: CreateAddressDto): Promise<Address> {
        // 1. Instanciamos el modelo con los datos del DTO
        const newAddress = new this.addressModel(addressDto);
        
        // 2. Lo guardamos en la base de datos (esto es asíncrono)
        return await newAddress.save();
    }

    async updateAddress(id: string, updateDto: UpdateAddressDto): Promise<Address> {
        // Buscamos y actualizamos. { new: true } devuelve el objeto editado.
        const updatedAddress = await this.addressModel.findByIdAndUpdate(
            id, 
            updateDto, 
            { new: true }
        ).lean();

        if (!updatedAddress) {
            throw new NotFoundException('Address not found')
        }

        return updatedAddress;
    }

    async deleteAddress(addressId: string): Promise<{message:string}>{
        const result = await this.addressModel.deleteOne({ _id: addressId });

        if (result.deletedCount === 0) {
            throw new NotFoundException('Address not found');
        }

        return { 
            message: 'Address deleted successfully', 
        };
    }
}
