import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import HealthDashboard from "@/components/health-dashboard";
import FaceScanModal from "@/components/face-scan-modal";
import { useState, useEffect } from "react";
import { 
  Heart, 
  Camera, 
  FileText, 
  Mic, 
  Moon, 
  Sun, 
  Globe,
  Settings,
  Trophy,
  Target
} from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showScanModal, setShowScanModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentLanguage, setCurrentLanguage] = useState("EN");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-logout after 10 minutes of inactivity
    let inactivityTimer: NodeJS.Timeout;
    const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutes

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logoutMutation.mutate();
      }, INACTIVITY_TIME);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [logoutMutation]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleLanguage = () => {
    setCurrentLanguage(currentLanguage === "EN" ? "HI" : "EN");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Health Monitor</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">Dashboard</a>
              <a href="#reports" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">Reports</a>
              <a href="#profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">Profile</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" size="sm" onClick={toggleLanguage}>
                <Globe className="h-4 w-4 mr-1" />
                {currentLanguage}
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="gradient-bg text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName}!
                  </h1>
                  <p className="text-blue-100">Ready for your daily health check?</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatDate(currentTime)}</div>
                  <div className="text-blue-100">{formatTime(currentTime)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="health-card cursor-pointer" onClick={() => setShowScanModal(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start Health Scan</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">10-second AI face analysis</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Camera className="text-white h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="health-card cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">View Reports</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Download PDF reports</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <FileText className="text-white h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="health-card cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Voice Assistant</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Listen to your report</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Mic className="text-white h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Dashboard */}
        <HealthDashboard />

        {/* Face Scan Modal */}
        {showScanModal && (
          <FaceScanModal 
            isOpen={showScanModal} 
            onClose={() => setShowScanModal(false)} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="text-white h-4 w-4" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">AI Health Monitor</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Your personal AI-powered health assistant for comprehensive wellness monitoring.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>AI Face Scanning</li>
                <li>Health Analytics</li>
                <li>Voice Assistant</li>
                <li>PDF Reports</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Install App</h3>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Target className="h-4 w-4 mr-2" />
                Install PWA
              </Button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">© 2024 AI Health Monitor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
