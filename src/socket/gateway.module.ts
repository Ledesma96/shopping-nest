import { Module } from "@nestjs/common";
import { ProductModule } from "src/product/product.module";
import { GatewayService } from "./gateway.service";
import { ConnectionEvents } from "./connection/connection.events";
import { ProductsEvents } from "./products/products.event";

@Module({
    imports:[
        ProductModule
    ],
    providers: [
        GatewayService,
        ConnectionEvents,
        ProductsEvents
    ]
})

export class GatewayModule{}