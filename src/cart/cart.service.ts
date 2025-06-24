import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Cart, CartDocument } from './schema/cart.schema';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    ) {}

    async createCart(userId: string): Promise<CartDocument> {
        const newCart = new this.cartModel({
            userId: new Types.ObjectId(userId),
            active: true,
            products: [],
        });
        return await newCart.save();
    }

    async getAllCartsToUser(userId: string): Promise<CartDocument[]> {
        const carts = await this.cartModel.find({ userId: new Types.ObjectId(userId) });

        if (carts.length === 0) {
            throw new NotFoundException('No carts found for this user');
        }

        return carts;
    }

    async addOrUpdateCart(dto: AddToCartDto, userId: string): Promise<CartDocument> {
        let cart: CartDocument | null = await this.cartModel.findOne({
            userId: new Types.ObjectId(userId),
            active: true,
        });

        if (!cart) {
            cart = await this.createCart(userId);
        }

        const existingProduct = cart.products.find(p => p.productId.equals(dto.productId));

        if (existingProduct) {
            existingProduct.quantity += dto.quantity;

            if (existingProduct.quantity <= 0) {
                cart.products = cart.products.filter(p => !p.productId.equals(dto.productId));
            }
        } else if (dto.quantity > 0) {
            cart.products.push({
                productId: new Types.ObjectId(dto.productId),
                quantity: dto.quantity,
            });
        }

        return await cart.save();
    }

    async deleteCart(userId: string, cartId: string): Promise<boolean> {
        const cart = await this.cartModel.findById(cartId);

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        if (!cart.userId.equals(userId)) {
            throw new ForbiddenException('You can only delete your own carts');
        }

        await cart.deleteOne();
        return true;
    }
}