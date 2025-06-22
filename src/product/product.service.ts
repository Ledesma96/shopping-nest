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
    ){}

    async createProduct(newProduct: CreateProductDto, seller: string): Promise<Product> {
        const product = new this.productModel({
            ...newProduct,
            seller: new mongoose.Types.ObjectId(seller),
        });
        return product.save();
    }

    async getProduct(_id: string): Promise<ProductDocument>{
        const product = await this.productModel.findById(_id);
        return product
    }

    async getAllProducts(
        name: string,
        limit: number,
        page: number,
        category?: string,
        sort: number = 1,
        minPrice?: number,
        maxPrice?: number,
        tags?: string
    ): Promise<{
        success: boolean;
        message: string;
        products?: any;
        totalDocs?: number;
        totalPages?: number;
        limit?: number;
        page?: number;
    }> {
        try {
            const filters: any = {};
    
            // ✅ Filtrado por categoría (recuerda: tu schema tiene "categories: string[]")
            if (category) filters.categories = { $in: [category] };
            
            if(tags) filters.tags = {$in: [tags]}
    
            // ✅ Filtro por precio
            if (minPrice !== undefined || maxPrice !== undefined) {
                filters.price = {};
                if (minPrice !== undefined) filters.price.$gte = minPrice;
                if (maxPrice !== undefined) filters.price.$lte = maxPrice;
            }
    
            // ✅ Filtrado por nombre con regex (búsqueda parcial, case insensitive)
            if (name) filters.title = { $regex: name, $options: 'i' };

    
            const result = await this.productModel.paginate(filters, {
                page,
                limit,
                lean: true,
                sort: { price: sort },
            });
    
            if (!result || result.docs.length === 0) {
                throw new Error('Products not found');
            }
    
            return {
                success: true,
                message: 'Products obtained successfully',
                products: result.docs,
                totalDocs: result.totalDocs,
                totalPages: result.totalPages,
                limit: result.limit,
                page: result.page,
            };
        } catch (error) {
            throw error;
        }
    }
    

    async updateProduct(_id: string, data: UpdateProductDto): Promise<ProductDocument> {
        const product = await this.productModel.findOneAndUpdate({ _id }, data, { new: true });
    
        if (!product) {
            throw new Error('Product not found or not updated');
        }
    
        return product;
    }
    
    async deleteProduct(productId: string): Promise<boolean>{
        const result = await this.productModel.findByIdAndDelete(productId);
        if (!result) {
            throw new NotFoundException('Product nos found');
        }
        return true
    }
}
