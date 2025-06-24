import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartDocument } from './schema/cart.schema';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    async getAllCartsToUser(@Req() req): Promise<CartDocument[]> {
        return await this.cartService.getAllCartsToUser(req.user._id);
    }

    @Post('add-or-update')
    async addOrUpdateCart(
        @Body() productDto: AddToCartDto,
        @Req() req,
    ): Promise<CartDocument> {
        try {
            return await this.cartService.addOrUpdateCart(productDto, req.user._id);
        } catch (error) {
            throw new HttpException('Error updating cart', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':cartId')
    async deleteCart(
        @Param('cartId') cartId: string,
        @Req() req,
    ): Promise<boolean> {
        return await this.cartService.deleteCart(req.user._id, cartId);
    }
}
