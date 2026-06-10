import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GameEvent } from '../types';

type EventCallback = (event: GameEvent) => void;

class WebSocketService {
  private client: Client | null = null;
  private connectionPromise: Promise<void> | null = null;
  private lobbySubscriptions: Map<string, EventCallback> = new Map();
  private gameSubscriptions: Map<string, EventCallback> = new Map();
  private personalSubscriptions: Map<string, EventCallback> = new Map();

  connect(): Promise<void> {
    if (this.client?.active) return Promise.resolve();
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.connectionPromise = null;
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      this.client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        reconnectDelay: 5000,
        onConnect: () => {
          clearTimeout(timeout);
          this.connectionPromise = null;
          this.lobbySubscriptions.forEach((callback, code) => {
            this.subscribeToLobby(code, callback);
          });
          this.gameSubscriptions.forEach((callback, code) => {
            this.subscribeToGame(code, callback);
          });
          this.personalSubscriptions.forEach((callback, playerId) => {
            this.subscribeToPersonalQueue(playerId, callback);
          });
          resolve();
        },
        onWebSocketError: () => {
          clearTimeout(timeout);
          this.connectionPromise = null;
          reject(new Error('WebSocket error'));
        },
        onStompError: (frame) => {
          clearTimeout(timeout);
          this.connectionPromise = null;
          reject(new Error(frame.headers['message'] || 'STOMP error'));
        },
      });

      this.client.activate();
    });

    return this.connectionPromise;
  }

  disconnect() {
    this.client?.deactivate();
    this.client = null;
    this.connectionPromise = null;
    this.lobbySubscriptions.clear();
    this.gameSubscriptions.clear();
    this.personalSubscriptions.clear();
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

  subscribeToPersonalQueue(playerId: string, callback: EventCallback) {
    this.personalSubscriptions.set(playerId, callback);
    if (this.client?.active) {
      this.client.subscribe(`/topic/player-${playerId}`, (message: IMessage) => {
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
