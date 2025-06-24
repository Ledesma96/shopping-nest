import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { DeleteReviewDto } from './dto/delete-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewDocument } from './schema/review.schema';

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel(Review.name) private readonly ReviewModel: Model<Review>
    ){}

    async createReview(data: CreateReviewDto): Promise<boolean>{
        const review = await this.ReviewModel.create(data)
        return true
    }

    async getReviewsProduct(productId: string): Promise<ReviewDocument[]>{
        const reviews = await this.ReviewModel.find({product: productId})
        if(!reviews || reviews.length <= 0){
            throw new NotFoundException('Reviews not find');
        }
        return reviews
    }

    async updateReview(data: UpdateReviewDto): Promise<ReviewDocument>{
        const review = await this.ReviewModel.findById(data.reviewId);
        
        if(review.user.toString() != data.userId){
            throw new ForbiddenException('Access denied');
        }
        const result = await this.ReviewModel.findByIdAndUpdate(data.reviewId, {comment: data.comment}, {new: true})
        
        return result
    }

    async deleteReview(data: DeleteReviewDto): Promise<boolean> {
        const review = await this.ReviewModel.findById(data.reviewId);
        
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        if (review.user.toString() !== data.userId) {
            throw new ForbiddenException('Access denied');
        }

        await this.ReviewModel.findByIdAndDelete(data.reviewId);

        return true;
    }
}
