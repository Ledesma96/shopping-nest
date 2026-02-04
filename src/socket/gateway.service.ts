import { Injectable } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ConnectionEvents } from "./connection/connection.events";
import { ProductsEvents } from "./products/products.event";


@WebSocketGateway(8080, {
    cors: {
        origin: '*',
        credentials: true
    }
})
@Injectable()
export class GatewayService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    userSockets = new Map<string, string>(); // Mapa de usuarios conectados y sus sockets
    constructor(
        private readonly connectionEvents: ConnectionEvents,
        private readonly productsEvents: ProductsEvents
    ){}
    afterInit(server: Server) {
        console.log('WebSocketService inicializado ��');
    }

    async handleConnection(client: Socket): Promise<void>{
        this.connectionEvents.On(client)
    }

    async handleDisconnect(client: Socket): Promise<void> {
        this.connectionEvents.Off(client)
    }

    @SubscribeMessage('find-product-by-name')
    async findProduct(
        @MessageBody() name: string,
        @ConnectedSocket() client: Socket
    ){
        this.productsEvents.findProducts(name, client)
    }
}