import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartDocument } from './schema/cart.schema';

@Controller('cart')
export class CartController {
    constructor(
        private readonly cartService: CartService
    ){}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllCartsToUser(
        @Req() req
    ): Promise<CartDocument[]>
    {
        try {
            const userId = req.user._id;
            const carts = this.cartService.getAllCartsToUser(userId)
            return carts
        } catch (error) {
            if(error.message == 'No carts found for this user'){
                throw new HttpException(
                    'No carts found for this user',
                    HttpStatus.NOT_FOUND
                )
            }
            throw new HttpException('Error updating cart', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/add-or-update-to-cart')
    @UseGuards(JwtAuthGuard)
    async addOrUpdateCart(
        @Body() product: AddToCartDto,
        @Req() req
    ): Promise<CartDocument> {
        try {
            const userId = req.user._id;
            return await this.cartService.addOrUpdateCart(product, userId);
        } catch (error) {
            console.error(error); // Puedes registrar el error
            throw new HttpException('Error updating cart', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('/delete-cart/:cartId')
    @UseGuards(JwtAuthGuard)
    async deleteCart(
        @Param('cartId') cartId: string,
        @Req() req
    ): Promise<boolean>
    {
        try {
            const userId = req.user._id
            const deletedCart = await this.cartService.deleteCart(userId, cartId)
            return deletedCart
        } catch (error) {
            throw new HttpException(
                'Internal server erro',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
