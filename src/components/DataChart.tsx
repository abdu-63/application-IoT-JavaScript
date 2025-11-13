import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { WebSocketService } from "@/services/websocket.service";

interface ChartData {
  time: string;
  temperature: number;
  humidity: number;
  light: number;
}

export const DataChart = () => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Charger l'historique des capteurs depuis localStorage
    const history = JSON.parse(localStorage.getItem('sensor_history') || '[]');
    const chartData = history.slice(-20).map((item: any) => ({
      time: new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      temperature: item.temperature,
      humidity: item.humidity,
      light: item.light
    }));
    
    setData(chartData);
    
    // Écouter les nouvelles données via WebSocket
    const handleSensorData = (sensorData: any) => {
      const newDataPoint = {
        time: new Date(sensorData.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        light: sensorData.light
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
      <h2 className="text-xl font-semibold mb-6">
        Évolution des capteurs
      </h2>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
              name="Température (°C)"
            />
            <Line 
              type="monotone" 
              dataKey="humidity" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
              name="Humidité (%)"
            />
            <Line 
              type="monotone" 
              dataKey="light" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
              name="Luminosité (lux)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-#ef4444" />
          <span className="text-sm text-muted-foreground">Température (°C)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-#3b82f6" />
          <span className="text-sm text-muted-foreground">Humidité (%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-#f59e0b" />
          <span className="text-sm text-muted-foreground">Luminosité (lux)</span>
        </div>
      </div>
    </Card>
  );
};
