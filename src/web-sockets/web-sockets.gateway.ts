import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: '*' })
export class WebSocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  handleConnection(client: any) {
    const userId = client.handshake.query.userId;
    console.log(`Client with user id of ${userId} connected`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomName: string) {
    client.join(roomName);
  }

  handleDisconnect(client: any) {
    const userId = client.handshake.query.userId;
    console.log(`Client with user id of ${userId} disconnected`);
  }
}
