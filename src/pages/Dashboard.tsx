import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SensorCard } from "@/components/SensorCard";
import { DeviceControl } from "@/components/DeviceControl";
import { AlertPanel } from "@/components/AlertPanel";
import { DataChart } from "@/components/DataChart";
import { MotionChart } from "@/components/MotionChart";
import {
  Thermometer,
  Droplets,
  Eye,
  Sun,
  Lightbulb,
  Fan,
  Power,
  LogOut,
  Wifi,
  Settings,
  History,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { WebSocketService, SensorData } from "@/services/websocket.service";
import { AlertService } from "@/services/alert.service";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 24,
    humidity: 45,
    motion: 0,
    light: 750,
    timestamp: new Date().toISOString(),
  });
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification JWT
    if (!AuthService.isAuthenticated()) {
      navigate("/");
      return;
    }

    // Demander permission notifications
    AlertService.requestNotificationPermission();

    // Initialiser WebSocket
    const ws = WebSocketService.getInstance();
    setWsConnected(ws.isConnectedStatus());

    // Écouter les données des capteurs
    const handleSensorData = (data: SensorData) => {
      setSensorData(data);

      // Vérifier les seuils d'alerte
      AlertService.checkThresholds('temperature', data.temperature);
      AlertService.checkThresholds('humidity', data.humidity);
      AlertService.checkThresholds('light', data.light);
      if (data.motion === 1) {
        AlertService.checkThresholds('motion', data.motion);
      }
    };

    ws.on('sensor_data', handleSensorData);

    // Écouter les alertes WebSocket
    const handleAlert = (alert: any) => {
      toast.warning(alert.message, {
        description: new Date(alert.timestamp).toLocaleString('fr-FR'),
      });
    };

    ws.on('alert', handleAlert);

    return () => {
      ws.off('sensor_data', handleSensorData);
      ws.off('alert', handleAlert);
    };
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    WebSocketService.getInstance().disconnect();
    navigate("/");
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp > 28) return "critical";
    if (temp > 26) return "warning";
    return "normal";
  };

  const getHumidityStatus = (hum: number) => {
    if (hum > 70 || hum < 30) return "warning";
    return "normal";
  };

  const getMotionStatus = (motion: number) => {
    return motion ? "warning" : "normal";
  };

  // Formatage de la date de dernière mise à jour
  const formatLastUpdate = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Wifi className={`w-6 h-6 ${wsConnected ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">IoT Dashboard</h1>
              <div className="flex items-center gap-2">
                <Badge variant={wsConnected ? "default" : "secondary"} className="text-xs">
                  {wsConnected ? "Connecté" : "Déconnecté"}
                </Badge>
                <span className="text-xs text-muted-foreground">JWT Sécurisé</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/history")}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              Historique
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings")}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Config
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Sensor Grid */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Capteurs en direct</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SensorCard 
              type="temperature" 
              value={sensorData.temperature} 
              unit="°C" 
              status={getTemperatureStatus(sensorData.temperature)} 
              lastUpdate={formatLastUpdate(sensorData.timestamp)}
            />
            <SensorCard 
              type="humidity" 
              value={Math.round(sensorData.humidity)} 
              unit="%" 
              status={getHumidityStatus(sensorData.humidity)} 
              lastUpdate={formatLastUpdate(sensorData.timestamp)}
            />
            <SensorCard 
              type="motion" 
              value={sensorData.motion} 
              unit="" 
              status={getMotionStatus(sensorData.motion)} 
              lastUpdate={formatLastUpdate(sensorData.timestamp)}
            />
            <SensorCard 
              type="light" 
              value={Math.round(sensorData.light)} 
              unit="lux" 
              status="normal" 
              lastUpdate={formatLastUpdate(sensorData.timestamp)}
            />
          </div>
        </section>

        {/* Chart Section */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DataChart />
            <MotionChart />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Controls */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Contrôle des dispositifs</h2>
            <div className="space-y-4">
              <DeviceControl name="Éclairage principal" icon={Lightbulb} />
              <DeviceControl name="Ventilation" icon={Fan} initialState={true} />
              <DeviceControl name="Système de chauffage" icon={Power} />
            </div>
          </section>

          {/* Alert Panel */}
          <section>
            <AlertPanel />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
