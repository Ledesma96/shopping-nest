import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsString()
    product: string;

    @IsString()
    user: string;
    
    @IsString()
    @IsNotEmpty()
    comment: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;
}
