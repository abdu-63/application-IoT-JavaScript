import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { WebSocketService } from "@/services/websocket.service";

interface MotionData {
  time: string;
  motion: number;
}

export const MotionChart = () => {
  const [data, setData] = useState<MotionData[]>([]);

  useEffect(() => {
    // Charger l'historique des mouvements depuis localStorage
    const history = JSON.parse(localStorage.getItem('sensor_history') || '[]');
    const motionData = history.slice(-20).map((item: any) => ({
      time: new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      motion: item.motion
    }));
    
    setData(motionData);
    
    // Écouter les nouvelles données via WebSocket
    const handleSensorData = (sensorData: any) => {
      const newDataPoint = {
        time: new Date(sensorData.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        motion: sensorData.motion
      };
      
      setData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.length > 20 ? updated.slice(-20) : updated;
      });
    };
    
    WebSocketService.getInstance().on('sensor_data', handleSensorData);
    
    return () => {
      WebSocketService.getInstance().off('sensor_data', handleSensorData);
    };
  }, []);

  return (
    <Card className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6">Historique des mouvements</h2>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              tick={{ fontSize: 12 }} 
              tickFormatter={(value) => value === 1 ? 'Détecté' : 'Aucun'}
              domain={[0, 1]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value) => [value === 1 ? 'Détecté' : 'Aucun', 'Mouvement']}
            />
            <Legend />
            <Bar 
              dataKey="motion" 
              name="Mouvement"
              fill="#8b5cf6" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-#8b5cf6" />
          <span className="text-sm text-muted-foreground">Mouvement</span>
        </div>
      </div>
    </Card>
  );
};
