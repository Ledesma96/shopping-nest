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
    Param,
    Post,
    Put,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import { ProductDocument } from './schema/product.schema';

@Controller('api/v1/products')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'images', maxCount: 10 }
    ]))
    @Post('/add-product')
    async createProduct(
        @Req() req,
        @Body('product') product: string,
        @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] }
    ) {
        try {
            const sellerId = req.user._id;
            const parsedProduct = JSON.parse(product);
            const newProduct = await this.productService.createProduct(parsedProduct, sellerId, files);
            return { success: true, message: 'Product created successfully', newProduct };
        } catch (error) {
            if (error.code === 11000) {
            throw new ConflictException('Product with this name already exists for this user.');
            }
            throw new InternalServerErrorException('Failed to create product.');
        }
    }

    @Get('/get-all-products')
async getAllProducts(
    @Query('name') name?: string,
    @Query('limit') limit: string = '10',
    @Query('page') page: string = '1',
    @Query('sort') sort: string = '1',
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
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

    @Get('/get-product-by-id/:id')
    async getProductById(
        @Param('id') id: string
    ): Promise<{success: boolean, message: string, product: ProductDocument}>{
        const result = await this.productService.getProductById(id);
        return {success: true, message: 'Get product successfully', product: result}
    }
}
