import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Droplets, Activity, Brain, Battery, Smile } from "lucide-react";
import type { HealthReport } from "@shared/schema";

interface HealthMetricsGridProps {
  report: HealthReport | null | undefined;
}

export default function HealthMetricsGrid({ report }: HealthMetricsGridProps) {
  if (!report) {
    const placeholderMetrics = [
      {
        icon: Heart,
        title: "Heart Rate",
        description: "Monitor your heart health",
        iconBg: "bg-red-100 dark:bg-red-900/20",
        iconColor: "text-red-500",
        action: "Complete a scan to view"
      },
      {
        icon: Activity,
        title: "Oxygen Level",
        description: "Track blood oxygen saturation",
        iconBg: "bg-blue-100 dark:bg-blue-900/20",
        iconColor: "text-blue-500",
        action: "Complete a scan to view"
      },
      {
        icon: Droplets,
        title: "Blood Sugar",
        description: "Monitor glucose levels",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
        iconColor: "text-yellow-500",
        action: "Complete a scan to view"
      },
      {
        icon: Brain,
        title: "Stress Level",
        description: "Analyze mental wellness",
        iconBg: "bg-purple-100 dark:bg-purple-900/20",
        iconColor: "text-purple-500",
        action: "Complete a scan to view"
      },
      {
        icon: Battery,
        title: "Energy Level",
        description: "Track vitality and alertness",
        iconBg: "bg-green-100 dark:bg-green-900/20",
        iconColor: "text-green-500",
        action: "Complete a scan to view"
      },
      {
        icon: Smile,
        title: "Mood Analysis",
        description: "AI-powered emotion detection",
        iconBg: "bg-indigo-100 dark:bg-indigo-900/20",
        iconColor: "text-indigo-500",
        action: "Complete a scan to view"
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placeholderMetrics.map((metric, i) => (
          <Card key={i} className="health-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                    <metric.icon className={`${metric.iconColor} h-5 w-5`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{metric.title}</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  Waiting
                </Badge>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {metric.description}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {metric.action}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getHealthStatus = (value: number, type: 'heartRate' | 'oxygen' | 'bloodSugar') => {
    switch (type) {
      case 'heartRate':
        if (value >= 60 && value <= 100) return { status: "Normal", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
        if (value < 60) return { status: "Low", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" };
        return { status: "High", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" };
      
      case 'oxygen':
        if (value >= 95) return { status: "Excellent", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
        if (value >= 90) return { status: "Good", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" };
        return { status: "Low", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" };
      
      case 'bloodSugar':
        if (value >= 70 && value <= 140) return { status: "Normal", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
        if (value < 70) return { status: "Low", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" };
        return { status: "High", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" };
    }
  };

  const getStressColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case 'medium': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case 'high': return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const metrics = [
    {
      icon: Heart,
      title: "Heart Rate",
      value: report.heartRate,
      unit: "bpm",
      status: getHealthStatus(report.heartRate, 'heartRate'),
      iconBg: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-red-500"
    },
    {
      icon: Activity,
      title: "Oxygen Level",
      value: report.oxygenLevel,
      unit: "% SpO₂",
      status: getHealthStatus(report.oxygenLevel, 'oxygen'),
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-500"
    },
    {
      icon: Droplets,
      title: "Blood Sugar",
      value: report.bloodSugar,
      unit: "mg/dL",
      status: getHealthStatus(report.bloodSugar, 'bloodSugar'),
      iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColor: "text-yellow-500"
    },
    {
      icon: Brain,
      title: "Stress Level",
      value: report.stressLevel,
      unit: "Relaxed state",
      status: { status: report.stressLevel, color: getStressColor(report.stressLevel) },
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-500"
    },
    {
      icon: Battery,
      title: "Energy Level",
      value: report.energyLevel,
      unit: "Well rested",
      status: { status: report.energyLevel, color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-500"
    },
    {
      icon: Smile,
      title: "Mood",
      value: report.detectedMood,
      unit: `Confident ${report.moodConfidence}%`,
      status: { status: "Positive", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      iconBg: "bg-indigo-100 dark:bg-indigo-900/20",
      iconColor: "text-indigo-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="health-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                  <metric.icon className={`${metric.iconColor} h-5 w-5`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{metric.title}</h3>
              </div>
              <Badge className={`${metric.status.color} text-xs`}>
                {metric.status.status}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {metric.unit}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
