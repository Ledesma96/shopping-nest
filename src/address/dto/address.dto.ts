import { Expose, Transform } from 'class-transformer';

export class AddressDto {
    @Expose({ name: '_id' })
    @Transform(({ value }) => value?.toString())
    _id: string;

    @Expose()
    addressType: string;

    @Expose()
    street: string;

    @Expose()
    city: string;

    @Expose()
    cp: string;
}