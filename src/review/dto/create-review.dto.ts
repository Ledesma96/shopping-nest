import { IsMongoId, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { Types } from 'mongoose';

export class CreateReviewDto {
    @IsMongoId({ message: 'El user debe ser un ObjectId válido o string que represente uno' })
    product:  string | Types.ObjectId;

    @IsMongoId({ message: 'El user debe ser un ObjectId válido o string que represente uno' })
    user: string | Types.ObjectId;
    
    @IsString()
    @IsNotEmpty()
    comment: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;
}
