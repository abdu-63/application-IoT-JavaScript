import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Bell, Shield } from "lucide-react";
import { AlertService, AlertThreshold } from "@/services/alert.service";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/");
      return;
    }

    setThresholds(AlertService.getThresholds());
    setNotificationsEnabled(Notification.permission === 'granted');
  }, [navigate]);

  const handleSave = () => {
    AlertService.saveThresholds(thresholds);
    toast.success("Configuration sauvegardée");
  };

  const updateThreshold = (id: string, field: keyof AlertThreshold, value: any) => {
    setThresholds(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleNotificationToggle = async () => {
    const enabled = await AlertService.requestNotificationPermission();
    setNotificationsEnabled(enabled);
    if (enabled) {
      toast.success("Notifications activées");
    } else {
      toast.error("Notifications refusées");
    }
  };

  const getSensorLabel = (type: string) => {
    const labels: Record<string, string> = {
      temperature: 'Température (°C)',
      humidity: 'Humidité (%)',
      light: 'Luminosité (lux)',
      motion: 'Mouvement'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
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

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Configuration</h1>
          <p className="text-muted-foreground">Gérez les seuils d'alerte et les paramètres de sécurité</p>
        </div>

        {/* Notifications */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Recevoir des alertes en temps réel</p>
            </div>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
        </Card>

        {/* Seuils d'alertes */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Seuils d'alerte</h2>
              <p className="text-sm text-muted-foreground">Configurez les limites pour chaque capteur</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {thresholds.map((threshold) => (
              <div key={threshold.id} className="space-y-4 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    {getSensorLabel(threshold.sensorType)}
                  </Label>
                  <Switch
                    checked={threshold.enabled}
                    onCheckedChange={(checked) => 
                      updateThreshold(threshold.id, 'enabled', checked)
                    }
                  />
                </div>

                {threshold.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    {threshold.minValue !== undefined && (
                      <div className="space-y-2">
                        <Label htmlFor={`min-${threshold.id}`}>Minimum</Label>
                        <Input
                          id={`min-${threshold.id}`}
                          type="number"
                          value={threshold.minValue}
                          onChange={(e) => 
                            updateThreshold(threshold.id, 'minValue', parseFloat(e.target.value))
                          }
                        />
                      </div>
                    )}
                    {threshold.maxValue !== undefined && (
                      <div className="space-y-2">
                        <Label htmlFor={`max-${threshold.id}`}>Maximum</Label>
                        <Input
                          id={`max-${threshold.id}`}
                          type="number"
                          value={threshold.maxValue}
                          onChange={(e) => 
                            updateThreshold(threshold.id, 'maxValue', parseFloat(e.target.value))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}

                {threshold.enabled && (
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor={`notif-${threshold.id}`} className="text-sm">
                      Notifications pour ce capteur
                    </Label>
                    <Switch
                      id={`notif-${threshold.id}`}
                      checked={threshold.notificationEnabled}
                      onCheckedChange={(checked) => 
                        updateThreshold(threshold.id, 'notificationEnabled', checked)
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
