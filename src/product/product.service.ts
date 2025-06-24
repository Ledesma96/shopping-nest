import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { PaginateModel } from 'mongoose';
import { CreateProductDto } from './dto/create-producto.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schema/product.schema';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private readonly productModel: PaginateModel<Product>,
    ) {}

    async createProduct(newProduct: CreateProductDto, sellerId: string): Promise<Product> {
        const product = new this.productModel({
        ...newProduct,
        seller: new mongoose.Types.ObjectId(sellerId),
        });
        return product.save();
    }

    async getProductById(productId: string): Promise<ProductDocument> {
        const product = await this.productModel.findById(productId);
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async getAllProducts(
        name: string,
        limit: number,
        page: number,
        category?: string,
        sort: number = 1,
        minPrice?: number,
        maxPrice?: number,
        tags?: string,
    ): Promise<{
        success: boolean;
        message: string;
        products: any;
        totalDocs: number;
        totalPages: number;
        limit: number;
        page: number;
    }> {
        const filters: any = {};

        if (category) filters.categories = { $in: [category] };
        if (tags) filters.tags = { $in: [tags] };

        if (minPrice !== undefined || maxPrice !== undefined) {
        filters.price = {};
        if (minPrice !== undefined) filters.price.$gte = minPrice;
        if (maxPrice !== undefined) filters.price.$lte = maxPrice;
        }

        if (name) filters.title = { $regex: name, $options: 'i' };

        const result = await this.productModel.paginate(filters, {
        page,
        limit,
        lean: true,
        sort: { price: sort },
        });

        return {
        success: true,
        message: 'Products obtained successfully',
        products: result.docs,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        limit: result.limit,
        page: result.page,
        };
    }

    async updateProduct(productId: string, data: UpdateProductDto): Promise<ProductDocument> {
        const product = await this.productModel.findByIdAndUpdate(productId, data, { new: true });
        if (!product) throw new NotFoundException('Product not found or not updated');
        return product;
    }

    async deleteProduct(productId: string): Promise<boolean> {
        const result = await this.productModel.findByIdAndDelete(productId);
        if (!result) throw new NotFoundException('Product not found');
        return true;
    }
}
