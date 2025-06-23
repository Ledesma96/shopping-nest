import { IsString } from "class-validator";

export class DeleteReviewDto {
    @IsString()
    userId: string;

    @IsString()
    reviewId: string;
}