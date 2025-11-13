// Gestion des alertes et seuils configurables

export interface AlertThreshold {
  id: string;
  sensorType: 'temperature' | 'humidity' | 'light' | 'motion';
  minValue?: number;
  maxValue?: number;
  enabled: boolean;
  notificationEnabled: boolean;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  sensorType: string;
  value: number;
  timestamp: string;
  acknowledged: boolean;
}

export class AlertService {
  private static readonly THRESHOLDS_KEY = 'alert_thresholds';
  private static readonly ALERTS_KEY = 'alerts_history';

  // Obtenir les seuils par défaut
  static getDefaultThresholds(): AlertThreshold[] {
    return [
      {
        id: '1',
        sensorType: 'temperature',
        minValue: 18,
        maxValue: 28,
        enabled: true,
        notificationEnabled: true
      },
      {
        id: '2',
        sensorType: 'humidity',
        minValue: 30,
        maxValue: 70,
        enabled: true,
        notificationEnabled: true
      },
      {
        id: '3',
        sensorType: 'light',
        minValue: 100,
        maxValue: 900,
        enabled: true,
        notificationEnabled: false
      },
      {
        id: '4',
        sensorType: 'motion',
        maxValue: 1,
        enabled: true,
        notificationEnabled: true
      }
    ];
  }

  // Obtenir les seuils configurés
  static getThresholds(): AlertThreshold[] {
    const stored = localStorage.getItem(this.THRESHOLDS_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultThresholds();
  }

  // Sauvegarder les seuils
  static saveThresholds(thresholds: AlertThreshold[]): void {
    localStorage.setItem(this.THRESHOLDS_KEY, JSON.stringify(thresholds));
  }

  // Mettre à jour un seuil
  static updateThreshold(threshold: AlertThreshold): void {
    const thresholds = this.getThresholds();
    const index = thresholds.findIndex(t => t.id === threshold.id);
    if (index > -1) {
      thresholds[index] = threshold;
      this.saveThresholds(thresholds);
    }
  }

  // Vérifier les valeurs contre les seuils
  static checkThresholds(sensorType: string, value: number): Alert | null {
    const thresholds = this.getThresholds();
    const threshold = thresholds.find(t => t.sensorType === sensorType && t.enabled);
    
    if (!threshold) return null;

    let alert: Alert | null = null;

    if (threshold.maxValue !== undefined && value > threshold.maxValue) {
      alert = {
        id: Date.now().toString(),
        type: value > threshold.maxValue * 1.2 ? 'critical' : 'warning',
        message: `${sensorType} trop élevé: ${value}`,
        sensorType,
        value,
        timestamp: new Date().toISOString(),
        acknowledged: false
      };
    } else if (threshold.minValue !== undefined && value < threshold.minValue) {
      alert = {
        id: Date.now().toString(),
        type: value < threshold.minValue * 0.8 ? 'critical' : 'warning',
        message: `${sensorType} trop bas: ${value}`,
        sensorType,
        value,
        timestamp: new Date().toISOString(),
        acknowledged: false
      };
    }

    if (alert) {
      this.saveAlert(alert);
      
      // Envoyer une notification si activée
      if (threshold.notificationEnabled && 'Notification' in window) {
        this.sendNotification(alert);
      }
    }

    return alert;
  }

  // Sauvegarder une alerte
  private static saveAlert(alert: Alert): void {
    const alerts = this.getAlerts();
    alerts.unshift(alert);
    
    // Garder seulement les 100 dernières alertes
    if (alerts.length > 100) {
      alerts.splice(100);
    }
    
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
  }

  // Obtenir les alertes
  static getAlerts(): Alert[] {
    const stored = localStorage.getItem(this.ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Marquer une alerte comme acquittée
  static acknowledgeAlert(alertId: string): void {
    const alerts = this.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
    }
  }

  // Supprimer les alertes anciennes
  static clearOldAlerts(daysOld: number = 7): void {
    const alerts = this.getAlerts();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const filtered = alerts.filter(a => new Date(a.timestamp) > cutoffDate);
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(filtered));
  }

  // Envoyer une notification navigateur
  private static async sendNotification(alert: Alert): Promise<void> {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification('Alerte IoT', {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Alerte IoT', {
          body: alert.message,
          icon: '/favicon.ico',
          tag: alert.id
        });
      }
    }
  }

  // Demander la permission pour les notifications
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}
