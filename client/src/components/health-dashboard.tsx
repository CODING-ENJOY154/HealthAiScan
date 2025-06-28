import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import HealthMetricsGrid from "./health-metrics-grid";
import HealthTrendsChart from "./health-trends-chart";
import { generatePDFReport } from "@/lib/pdf-generator";
import { generateQRCode } from "@/lib/qr-generator";
import { readReportAloud, stopSpeech, isSpeechActive } from "@/lib/voice-assistant";
import { Download, Mail, QrCode, Volume2, VolumeX, Trophy, Leaf, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HealthDashboard() {
  const { toast } = useToast();
  const [isReading, setIsReading] = useState(false);

  const { data: latestReport } = useQuery({
    queryKey: ["/api/health-reports/latest"],
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/health-reports"],
  });

  const { data: badges } = useQuery({
    queryKey: ["/api/user/badges"],
  });

  const { data: dailyTip } = useQuery({
    queryKey: ["/api/daily-tip"],
  });

  const { data: airQuality } = useQuery({
    queryKey: ["/api/air-quality"],
    enabled: false, // Will enable when geolocation is available
  });

  // Get user's location for air quality
  const getAirQuality = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // This would trigger the air quality query with coordinates
          // For now, we'll simulate the data
          toast({
            title: "Location detected",
            description: "Fetching air quality data for your area...",
          });
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Unable to get air quality data without location access.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleDownloadPDF = async () => {
    if (!latestReport) {
      toast({
        title: "No report available",
        description: "Please complete a health scan first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generatePDFReport(latestReport);
      toast({
        title: "PDF Generated",
        description: "Your health report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Unable to generate PDF report.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQR = async () => {
    if (!latestReport) {
      toast({
        title: "No report available",
        description: "Please complete a health scan first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateQRCode(latestReport);
      toast({
        title: "QR Code Generated",
        description: "QR code for sharing your report has been created.",
      });
    } catch (error) {
      toast({
        title: "QR Generation Failed",
        description: "Unable to generate QR code.",
        variant: "destructive",
      });
    }
  };

  const handleReadAloud = () => {
    if (!latestReport) {
      toast({
        title: "No report available",
        description: "Please complete a health scan first.",
        variant: "destructive",
      });
      return;
    }

    if (isReading) {
      stopSpeech();
      setIsReading(false);
    } else {
      readReportAloud(latestReport);
      setIsReading(true);
    }
  };

  // Monitor speech status
  useEffect(() => {
    const checkSpeechStatus = () => {
      const speechActive = isSpeechActive();
      if (!speechActive && isReading) {
        setIsReading(false);
      }
    };
    
    const interval = setInterval(checkSpeechStatus, 500);
    return () => clearInterval(interval);
  }, [isReading]);

  const getWellnessLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "text-green-600" };
    if (score >= 60) return { level: "Good", color: "text-yellow-600" };
    if (score >= 40) return { level: "Fair", color: "text-orange-600" };
    return { level: "Needs Attention", color: "text-red-600" };
  };

  const badgeTypes = {
    health_beginner: { icon: "🏅", name: "Health Beginner" },
    consistency_pro: { icon: "🏆", name: "Consistency Pro" },
    wellness_master: { icon: "👑", name: "Wellness Master" },
    health_champion: { icon: "⭐", name: "Health Champion" },
  };

  return (
    <div className="space-y-8">
      {/* Current Wellness Score */}
      {latestReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Wellness Score
              <Button variant="ghost" size="icon">
                <Target className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-300 dark:text-gray-600"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-500"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${latestReport.wellnessScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-500">
                    {latestReport.wellnessScore}
                  </span>
                </div>
              </div>
              <p className={`text-lg font-semibold ${getWellnessLevel(latestReport.wellnessScore).color}`}>
                {getWellnessLevel(latestReport.wellnessScore).level}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Last updated: {new Date(latestReport.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Metrics */}
      <HealthMetricsGrid report={latestReport} />

      {/* Health Trends Chart */}
      <HealthTrendsChart reports={reports || []} />

      {/* Air Quality & Daily Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Air Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Air Quality Index
              <Leaf className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-green-600">42</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Good - San Francisco, CA
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={42} className="flex-1" />
                <span className="text-xs text-gray-500">100</span>
              </div>
              <Button variant="outline" size="sm" onClick={getAirQuality}>
                Update Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Challenge */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Daily Challenge
              <Trophy className="h-5 w-5 text-yellow-300" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 mb-4">
              {dailyTip?.tip || "Take a 15-minute walk outside to boost your mood and energy levels!"}
            </p>
            <Button className="bg-white text-purple-600 hover:bg-gray-100">
              Mark Complete
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Stay Active</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Based on your current mood and energy levels, light exercise would be beneficial.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Leaf className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Hydration Reminder</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  You haven't logged water intake today. Aim for 8 glasses to maintain optimal health.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Health Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center space-x-2 h-auto p-4 justify-start"
              onClick={handleDownloadPDF}
            >
              <Download className="text-blue-500 h-5 w-5" />
              <span>Download PDF</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center space-x-2 h-auto p-4 justify-start"
            >
              <Mail className="text-green-500 h-5 w-5" />
              <span>Email Report</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center space-x-2 h-auto p-4 justify-start"
              onClick={handleGenerateQR}
            >
              <QrCode className="text-purple-500 h-5 w-5" />
              <span>Share via QR</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center space-x-2 h-auto p-4 justify-start"
              onClick={handleReadAloud}
            >
              {isReading ? (
                <VolumeX className="text-red-500 h-5 w-5" />
              ) : (
                <Volume2 className="text-orange-500 h-5 w-5" />
              )}
              <span>{isReading ? "Stop Reading" : "Read Aloud"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Section */}
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Health Achievements
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-200" />
              <span className="font-bold">7 day streak!</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(badgeTypes).map(([key, badge]) => {
              const earned = badges?.some(b => b.badgeType === key);
              return (
                <div key={key} className={`text-center ${!earned ? 'opacity-50' : ''}`}>
                  <div className={`w-16 h-16 ${earned ? 'bg-yellow-300' : 'bg-gray-300'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <p className="text-sm font-medium">{badge.name}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
