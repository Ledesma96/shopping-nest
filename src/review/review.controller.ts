import {
    Body, Controller, Delete, Get,
    Post, Put, Query, Req, UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';
import { ReviewDocument } from './schema/review.schema';

@Controller('review')
export class ReviewController {
    constructor(
        private readonly reviewService: ReviewService
    ) {}

    @Post('create-review')
    @UseGuards(JwtAuthGuard)
    async createReview(
        @Body() data: Omit<CreateReviewDto, 'userId'>,
        @Req() req: any
    ): Promise<boolean> {
        return this.reviewService.createReview({ ...data, user: req.user._id });
    }

    @Get()
    async getReviewsProduct(
        @Query('productId') productId: string
    ): Promise<ReviewDocument[]> {
        return this.reviewService.getReviewsProduct(productId);
    }

    @Put('update-review')
    @UseGuards(JwtAuthGuard)
    async updateReview(
        @Body() data: Omit<UpdateReviewDto, 'userId'>,
        @Req() req: any,
    ): Promise<ReviewDocument> {
        return this.reviewService.updateReview({
            ...data,
            userId: req.user._id,
        });
    }

    @Delete('delete-review')
    @UseGuards(JwtAuthGuard)
    async deleteReview(
        @Query('reviewId') reviewId: string,
        @Req() req: any
    ): Promise<boolean> {
        return this.reviewService.deleteReview({
            reviewId,
            userId: req.user._id,
        });
    }
}
