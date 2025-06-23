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
        @Body() data: CreateReviewDto,
        @Req() req: any
    ): Promise<boolean> {
        const userId = req.user._id;
        return this.reviewService.createReview({ ...data, userId });
    }

    @Get()
    async getReviewProduct(
        @Query('productId') productId: string
    ): Promise<ReviewDocument[]> {
        return this.reviewService.getReviewProduct(productId);
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

    @Delete()
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
