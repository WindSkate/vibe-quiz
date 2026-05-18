import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GameEvent } from '../types';

type EventCallback = (event: GameEvent) => void;

class WebSocketService {
  private client: Client | null = null;
  private lobbySubscriptions: Map<string, EventCallback> = new Map();
  private gameSubscriptions: Map<string, EventCallback> = new Map();

  connect() {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.lobbySubscriptions.forEach((callback, code) => {
          this.subscribeToLobby(code, callback);
        });
        this.gameSubscriptions.forEach((callback, code) => {
          this.subscribeToGame(code, callback);
        });
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.client?.deactivate();
    this.client = null;
    this.lobbySubscriptions.clear();
    this.gameSubscriptions.clear();
  }

  subscribeToLobby(code: string, callback: EventCallback) {
    this.lobbySubscriptions.set(code, callback);
    if (this.client?.active) {
      this.client.subscribe(`/topic/lobby/${code}`, (message: IMessage) => {
        callback(JSON.parse(message.body));
      });
    }
  }

  subscribeToGame(code: string, callback: EventCallback) {
    this.gameSubscriptions.set(code, callback);
    if (this.client?.active) {
      this.client.subscribe(`/topic/game/${code}`, (message: IMessage) => {
        callback(JSON.parse(message.body));
      });
    }
  }

  send(destination: string, body: Record<string, unknown>) {
    if (this.client?.active) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }

  isConnected(): boolean {
    return this.client?.active || false;
  }
}

export const wsService = new WebSocketService();
