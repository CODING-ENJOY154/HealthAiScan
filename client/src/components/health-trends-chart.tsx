import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { HealthReport } from "@shared/schema";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HealthTrendsChartProps {
  reports: HealthReport[];
}

export default function HealthTrendsChart({ reports }: HealthTrendsChartProps) {
  if (!reports.length) return null;

  // Prepare data - last 7 reports
  const last7Reports = reports.slice(0, 7).reverse();
  const labels = last7Reports.map(report => 
    new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Wellness Score',
        data: last7Reports.map(report => report.wellnessScore),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Heart Rate',
        data: last7Reports.map(report => report.heartRate),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
      {
        label: 'Oxygen Level',
        data: last7Reports.map(report => report.oxygenLevel),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y2',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Wellness Score'
        }
      },
      y1: {
        type: 'linear' as const,
        display: false,
        position: 'right' as const,
        min: 50,
        max: 120,
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: 'linear' as const,
        display: false,
        position: 'right' as const,
        min: 85,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Health Trends</CardTitle>
          <div className="flex space-x-2">
            <Button variant="default" size="sm">
              7 Days
            </Button>
            <Button variant="outline" size="sm">
              30 Days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Chart type="line" data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
