import { IsMongoId, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsMongoId()
    product: string; // ID del producto que se reseña

    @IsString()
    @IsNotEmpty()
    comment: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;
}
