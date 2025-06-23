import { IsString } from "class-validator";

export class UpdateReviewDto {
    @IsString()
    reviewId: string
    
    @IsString()
    userId: string;

    @IsString()
    comment: string;
}