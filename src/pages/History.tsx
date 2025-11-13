import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, Bell, Terminal, Trash2 } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { AlertService, Alert } from "@/services/alert.service";
import { WebSocketService } from "@/services/websocket.service";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const History = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [commandLogs, setCommandLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/");
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = () => {
    setAlerts(AlertService.getAlerts());
    setActivityLogs(AuthService.getActivityLogs());
    setCommandLogs(WebSocketService.getCommandHistory());
  };

  const handleAcknowledge = (alertId: string) => {
    AlertService.acknowledgeAlert(alertId);
    loadData();
  };

  const handleClearOldAlerts = () => {
    AlertService.clearOldAlerts(7);
    loadData();
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd MMM yyyy HH:mm:ss", { locale: fr });
  };

  const getAlertColor = (type: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Historique & Logs</h1>
          <p className="text-muted-foreground">Consultez l'historique des alertes et activités système</p>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="w-4 h-4" />
              Alertes
            </TabsTrigger>
            <TabsTrigger value="commands" className="gap-2">
              <Activity className="w-4 h-4" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Terminal className="w-4 h-4" />
              Activité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearOldAlerts}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Nettoyer alertes anciennes
              </Button>
            </div>

            {alerts.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune alerte enregistrée</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={getAlertColor(alert.type)}>
                            {alert.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(alert.timestamp)}
                          </span>
                          {alert.acknowledged && (
                            <Badge variant="outline">Acquittée</Badge>
                          )}
                        </div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          Capteur: {alert.sensorType} | Valeur: {alert.value}
                        </p>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acquitter
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="commands" className="space-y-4">
            {commandLogs.length === 0 ? (
              <Card className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune commande enregistrée</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {commandLogs.slice().reverse().map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Dispositif: {log.deviceId}</p>
                        <p className="text-sm text-muted-foreground">
                          Action: <span className="font-mono">{log.action.toUpperCase()}</span>
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {activityLogs.length === 0 ? (
              <Card className="p-8 text-center">
                <Terminal className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune activité enregistrée</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {activityLogs.slice().reverse().map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge>{log.action}</Badge>
                          <span className="text-sm font-mono">User ID: {log.userId}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          IP: {log.ip}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default History;
