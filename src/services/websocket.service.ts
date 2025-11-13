import { io, Socket } from 'socket.io-client';
import { SensorData } from '../types/sensor';

export type DeviceCommand = {
  deviceId: string;
  action: 'on' | 'off';
  timestamp: string;
};

type MessageHandler = (data: any) => void;

const SOCKET_URL = 'http://localhost:3000';

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private isConnected = false;

  private constructor() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private setupEventListeners(): void {
    this.socket.on('connect', () => {
      console.log('[WebSocket] Connecté au serveur');
      this.isConnected = true;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('[WebSocket] Déconnecté du serveur');
      this.isConnected = false;
      this.emit('connection_status', { connected: false });
    });

    this.socket.on('sensor_data', (data: any) => {
      console.log('[WebSocket] Données capteur reçues:', data);
      this.emit('sensor_data', data);
      
      // Sauvegarder dans l'historique local
      this.saveSensorHistory(data);
    });

    this.socket.on('alert', (data: any) => {
      console.log('[WebSocket] Alerte reçue:', data);
      this.emit('alert', data);
    });

    this.socket.on('device_status', (data: any) => {
      console.log('[WebSocket] Statut dispositif reçu:', data);
      this.emit('device_status', data);
    });

    this.socket.on('command_ack', (data: any) => {
      console.log('[WebSocket] Ack commande reçu:', data);
      this.emit('command_ack', data);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Erreur de connexion:', error);
      this.isConnected = false;
    });

    this.socket.on('movement_data', (data: any) => {
      console.log('[WebSocket] Données de mouvement reçues:', data);
      this.emit('movement_data', data);
    });
  }

  connect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.isConnected = false;
  }

  // S'abonner à un type de message
  on(event: string, handler: MessageHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  // Se désabonner
  off(event: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Émettre un message (interne)
  private emit(event: string, data: any): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Envoyer une commande à un dispositif
  sendCommand(command: DeviceCommand): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket.connected) {
        console.error('[WebSocket] Non connecté au serveur');
        resolve(false);
        return;
      }

      console.log('[WebSocket] Envoi commande:', command);
      this.socket.emit('device_command', command);
      
      // Log dans l'historique
      this.logCommand(command);
      resolve(true);
    });
  }

  // Sauvegarder l'historique des capteurs
  private saveSensorHistory(data: SensorData): void {
    const history = JSON.parse(localStorage.getItem('sensor_history') || '[]');
    history.push(data);
    
    // Garder seulement les 1000 dernières mesures
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    localStorage.setItem('sensor_history', JSON.stringify(history));
  }

  // Logger les commandes
  private logCommand(command: DeviceCommand): void {
    const logs = JSON.parse(localStorage.getItem('command_logs') || '[]');
    logs.push({
      ...command,
      id: Date.now().toString()
    });
    
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('command_logs', JSON.stringify(logs));
  }

  // Obtenir l'historique des capteurs
  static getSensorHistory(): SensorData[] {
    return JSON.parse(localStorage.getItem('sensor_history') || '[]');
  }

  // Obtenir l'historique des commandes
  static getCommandHistory(): DeviceCommand[] {
    return JSON.parse(localStorage.getItem('command_logs') || '[]');
  }

  // Vérifier l'état de connexion
  isConnectedStatus(): boolean {
    return this.isConnected;
  }
}
