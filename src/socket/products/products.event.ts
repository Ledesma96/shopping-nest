import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { ProductService } from "src/product/product.service";

@Injectable()
export class ProductsEvents {
    constructor(
        private readonly productService: ProductService
    ){}

    async findProducts(
        name: string,
        client: Socket,
    ) {
        try {
            const response = await this.productService.findByName(name);
            console.log(response);
            
            client.emit('products', response)
        } catch (error) {
            console.error(error);
            client.emit('error', { message: error.message });
        }
    }
}