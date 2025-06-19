import { IsMongoId, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
    @IsMongoId()
    product: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}
