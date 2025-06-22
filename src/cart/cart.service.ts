import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Cart, CartDocument } from './schema/cart.schema';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart.name) private readonly CartModel: Model<CartDocument>
    ){}

    async createCart(userId: string): Promise<CartDocument> {
        const data = {
            userId: new Types.ObjectId(userId),
            active: true,
            products: []
        };
        const newCart = new this.CartModel(data);
        await newCart.save();
        return newCart;
    }

    async getAllCartsToUser(userId: string): Promise<CartDocument[]> {
        const carts = await this.CartModel.find({ userId: new Types.ObjectId(userId) });
    
        if (!carts.length) {
            throw new NotFoundException('No carts found for this user');
        }
    
        return carts;
    }
    
    async addOrUpdateCart(productDto: AddToCartDto, userId: string): Promise<CartDocument> {
        let cart: CartDocument | null = await this.CartModel.findOne({
            userId: new Types.ObjectId(userId),
            active: true,
        });
    
        if (!cart) cart = await this.createCart(userId);
    
        const existingProduct = cart.products.find(p => p.productId.toString() === productDto.productId);
    
        if (existingProduct) {
            existingProduct.quantity += productDto.quantity;
    
            // Si la cantidad es menor o igual a 0, eliminar el producto del carrito
            if (existingProduct.quantity <= 0) {
                cart.products = cart.products.filter(p => p.productId.toString() !== productDto.productId);
            }
        } else {
            if (productDto.quantity > 0) {
                cart.products.push({
                    productId: new Types.ObjectId(productDto.productId),
                    quantity: productDto.quantity,
                });
                console.log(cart);
            }
        }
    
        await cart.save();
        return cart;
    }

    async deleteCart(userId: string, cartId: string): Promise<boolean> {
        const cart = await this.CartModel.findById(cartId);

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        if (cart.userId.toString() !== userId) {
            throw new ForbiddenException('You can only delete your own carts');
        }

        await this.CartModel.findByIdAndDelete(cartId);
        return true;
    }

}
