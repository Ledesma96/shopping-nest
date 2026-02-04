import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";


@Injectable()
export class ConnectionEvents {
    constructor(
    ){}

    async On(client: Socket) {
        console.log(`Cliente conectado con socket ID: ${client.id}`);
        client.emit('connection', { message: 'Conexión establecida' });
    }

    async Off(client: Socket) {
        console.log(`Cliente desconectado con socket ID: ${client.id}`);
    }

}

