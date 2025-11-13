import { Card } from "@/components/ui/card"
import { Activity, Thermometer, Droplets, Sun, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface SensorCardProps {
  type: 'temperature' | 'humidity' | 'motion' | 'light'
  value: number | string
  unit: string
  status: 'normal' | 'warning' | 'critical'
  lastUpdate: string
}

export const SensorCard = ({ type, value, unit, status, lastUpdate }: SensorCardProps) => {
  const getIcon = () => {
    switch (type) {
      case 'temperature': return Thermometer
      case 'humidity': return Droplets
      case 'motion': return Eye
      case 'light': return Sun
      default: return Activity
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'normal': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getBgColor = () => {
    switch (status) {
      case 'normal': return 'bg-green-500/20'
      case 'warning': return 'bg-yellow-500/20'
      case 'critical': return 'bg-red-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  const Icon = getIcon()

  return (
    <Card className={cn("glass-card p-6 flex flex-col items-center gap-4", getBgColor())}>
      <div className={cn("p-3 rounded-full", getStatusColor())}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">
          {type === 'motion' ? (value ? 'Détecté' : 'Aucun') : Number(value).toFixed(1)}
          {type !== 'motion' && <span className="text-sm ml-1">{unit}</span>}
        </div>
        <div className="text-sm text-muted-foreground capitalize">
          {type === 'temperature' && 'Température'}
          {type === 'humidity' && 'Humidité'}
          {type === 'motion' && 'Mouvement'}
          {type === 'light' && 'Luminosité'}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Mis à jour: {lastUpdate}
        </p>
      </div>
    </Card>
  )
}
