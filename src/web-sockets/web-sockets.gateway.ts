import { Injectable } from '@nestjs/common';
import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: '*' })
@Injectable()
export class WebSocketsGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomName: string) {
    client.join(roomName);
  }

  handleDisconnect(client: Socket) {
    this.handleCleanUp(client);
  }

  private handleCleanUp(client: Socket) {
    const rooms = Object.keys(client.rooms);
    rooms.forEach((room) => client.leave(room));
  }
}
