import { Body, ConflictException, Controller, Delete, ForbiddenException, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-producto.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import { ProductDocument } from './schema/product.schema';

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ){}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createProduct(
        @Req() req,
        @Body() newProduct: CreateProductDto
    ) {
        try {
            const sellerId = req.user._id;
            const product = await this.productService.createProduct(newProduct, sellerId);
            return { success: true, message: 'Product created successfully', product };
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Product with this name already exists for this user.');
            }
            throw new InternalServerErrorException('Failed to create product.');
        }
    }

    @Get('/get-all-products')
    async getAllProducts(
        @Query('name') name: string,
        @Query('limit') limit: number,
        @Query('page') page: number,
        @Query('sort') sort: number,
        @Query('category') category?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('tags') tags?: string
    ): Promise<any> {
        try {
            return await this.productService.getAllProducts(
                name,
                limit,
                page,
                category,
                sort,
                minPrice,
                maxPrice,
                tags
            );
        } catch (error) {
            if (error.message === 'Products not found') {
                throw new NotFoundException('Products not found');
            }
            throw new HttpException(
                'internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Put('/update-product')
    @UseGuards(JwtAuthGuard)
    async updateProduct(
        @Body()data: UpdateProductDto,
        @Req() req,
        @Query('product_id') product_id: string
    ) : Promise<ProductDocument>
    {
        try {
            const userId = req.user._id;
            const product = await this.productService.getProduct(product_id)
            if(product.seller != userId){
                throw new ForbiddenException('You can only update your own account.');
            }
            const updateProduct = await this.productService.updateProduct(product_id, data);
            return updateProduct
        } catch (error) {
            
        }
    }

    @Delete('/delete-product')
    @UseGuards(JwtAuthGuard)
    async deleteProduct(
        @Req() req,
        @Query('product_id') product_id: string
    ): Promise<boolean>
    {
        try {
            const userId = req.user._id;
            const product = await this.productService.getProduct(product_id);
            
            if(product.seller.toString() != userId){
                console.log('error');
                
                throw new ForbiddenException('You can only update your own account.');
            }
            const result = await this.productService.deleteProduct(product_id);
            return result
        } catch (error) {
            if (error.message === 'Product not found') {
                throw new NotFoundException('Products not found');
            }
            throw new HttpException(
                'internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
