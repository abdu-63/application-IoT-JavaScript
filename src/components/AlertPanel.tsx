import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, Info, Bell } from "lucide-react";
import { WebSocketService } from "@/services/websocket.service";

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  sensorType: string;
  value: number;
  timestamp: string;
  acknowledged: boolean;
}

export const AlertPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Charger les alertes existantes depuis localStorage
    const storedAlerts = JSON.parse(localStorage.getItem('alerts_history') || '[]');
    setAlerts(storedAlerts);
    
    // Écouter les nouvelles alertes via WebSocket
    const handleAlert = (alert: Alert) => {
      setAlerts(prev => [alert, ...prev]);
      
      // Sauvegarder dans localStorage
      const updatedAlerts = [alert, ...storedAlerts];
      if (updatedAlerts.length > 100) {
        updatedAlerts.splice(100);
      }
      localStorage.setItem('alerts_history', JSON.stringify(updatedAlerts));
    };
    
    WebSocketService.getInstance().on('alert', handleAlert);
    
    return () => {
      WebSocketService.getInstance().off('alert', handleAlert);
    };
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'info':
        return <Info className="w-4 h-4 text-info" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-destructive/10 border-destructive/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      case 'info':
        return 'bg-info/10 border-info/20';
      default:
        return 'bg-muted border-muted';
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
    localStorage.removeItem('alerts_history');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Alertes récentes</h2>
        <Badge variant="secondary">{alerts.length}</Badge>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune alerte pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg border ${getAlertColor(alert.type)} flex items-start gap-3`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.timestamp).toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Capteur: {alert.sensorType} | Valeur: {alert.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={clearAlerts}
          >
            Effacer toutes les alertes
          </Button>
        </div>
      )}
    </Card>
  );
};
