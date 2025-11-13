import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Power, Wifi, WifiOff, CheckCircle, XCircle } from "lucide-react";
import { WebSocketService, DeviceCommand } from "@/services/websocket.service";
import { toast } from "sonner";

interface DeviceControlProps {
  name: string;
  icon: LucideIcon;
  deviceId?: string;
  initialState?: boolean;
}

export const DeviceControl = ({
  name,
  icon: Icon,
  deviceId = 'default-device',
  initialState = false
}: DeviceControlProps) => {
  const [isEnabled, setIsEnabled] = useState(initialState);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const ws = WebSocketService.getInstance();
    
    // Écouter l'état de connexion
    const handleConnectionStatus = (data: { connected: boolean }) => {
      setIsConnected(data.connected);
      if (!data.connected) {
        setDeviceStatus('offline');
      }
    };
    
    // Écouter le statut du dispositif
    const handleDeviceStatus = (data: { deviceId: string; status: string }) => {
      if (data.deviceId === deviceId) {
        setIsEnabled(data.status === 'on');
        setDeviceStatus('online');
      }
    };
    
    // Écouter les acknowledgments de commandes
    const handleCommandAck = (data: { success: boolean; command: DeviceCommand }) => {
      if (data.command.deviceId === deviceId) {
        setIsSending(false);
        if (data.success) {
          toast.success(`Commande exécutée: ${data.command.action.toUpperCase()}`);
        } else {
          toast.error('Échec de la commande');
        }
      }
    };
    
    // Écouter les erreurs de commandes
    const handleCommandError = (data: { message: string }) => {
      setIsSending(false);
      toast.error(data.message);
    };
    
    ws.on('connection_status', handleConnectionStatus);
    ws.on('device_status', handleDeviceStatus);
    ws.on('command_ack', handleCommandAck);
    ws.on('command_error', handleCommandError);
    
    return () => {
      ws.off('connection_status', handleConnectionStatus);
      ws.off('device_status', handleDeviceStatus);
      ws.off('command_ack', handleCommandAck);
      ws.off('command_error', handleCommandError);
    };
  }, [deviceId]);

  const handleToggle = async () => {
    if (!isConnected) {
      toast.error('Non connecté au serveur');
      return;
    }
    
    const newStatus = !isEnabled;
    setIsSending(true);
    
    try {
      // Envoyer la commande au dispositif
      const command: DeviceCommand = {
        deviceId,
        action: newStatus ? 'on' : 'off',
        timestamp: new Date().toISOString()
      };
      
      const success = await WebSocketService.getInstance().sendCommand(command);
      
      if (!success) {
        setIsSending(false);
        toast.error('Échec de l\'envoi de la commande');
      }
      // Si succès, on attend l'acknowledgment via WebSocket
    } catch (error) {
      setIsSending(false);
      toast.error('Erreur lors de l\'envoi de la commande');
      console.error('Error sending command:', error);
    }
  };

  const getStatusIcon = () => {
    switch (deviceStatus) {
      case 'online':
        return <CheckCircle className="w-3 h-3 text-success" />;
      case 'offline':
        return <XCircle className="w-3 h-3 text-destructive" />;
      default:
        return <WifiOff className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (deviceStatus) {
      case 'online':
        return 'En ligne';
      case 'offline':
        return 'Hors ligne';
      default:
        return 'Inconnu';
    }
  };

  return (
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {deviceId}
            </Badge>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-xs text-muted-foreground">
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={!isConnected || isSending || deviceStatus !== 'online'}
      />
      
      {isSending && (
        <div className="ml-2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
    </Card>
  );
};
