import {
    Body,
    ConflictException,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    Post,
    Put,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-producto.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createProduct(@Req() req, @Body() newProduct: CreateProductDto) {
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
        @Query('limit') limit = 10,
        @Query('page') page = 1,
        @Query('sort') sort = 1,
        @Query('category') category?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('tags') tags?: string,
    ) {
        try {
            return await this.productService.getAllProducts(
            name,
            +limit,
            +page,
            category,
            +sort,
            minPrice ? +minPrice : undefined,
            maxPrice ? +maxPrice : undefined,
            tags,
            );
        } catch (error) {
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/update-product')
    @UseGuards(JwtAuthGuard)
    async updateProduct(
        @Req() req,
        @Query('product_id') productId: string,
        @Body() data: UpdateProductDto,
        ) {
        const userId = req.user._id;
        const product = await this.productService.getProductById(productId);
    
        if (product.seller.toString() !== userId.toString()) {
            throw new ForbiddenException('You can only update your own products.');
        }
    
        return await this.productService.updateProduct(productId, data);
    }

    @Delete('/delete-product')
    @UseGuards(JwtAuthGuard)
    async deleteProduct(@Req() req, @Query('product_id') productId: string): Promise<{ success: boolean; message: string }> {
        const userId = req.user._id;
        const product = await this.productService.getProductById(productId);
    
        if (product.seller.toString() !== userId.toString()) {
            throw new ForbiddenException('You can only delete your own products.');
        }

        await this.productService.deleteProduct(productId);
        return { success: true, message: 'Product deleted successfully' };
    }
}
