import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, X, CheckCircle } from "lucide-react";
import { detectFaceAndEmotion, initializeFaceAPI } from "@/lib/face-detection";
import { generateHealthMetrics } from "@/lib/health-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FaceScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FaceScanModal({ isOpen, onClose }: FaceScanModalProps) {
  const [countdown, setCountdown] = useState(10);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [status, setStatus] = useState("Click 'Start Scan' to begin");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createHealthReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const res = await apiRequest("POST", "/api/health-reports", reportData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/health-reports/latest"] });
      toast({
        title: "Health scan completed!",
        description: "Your health report has been generated successfully.",
      });
      setScanComplete(true);
      setTimeout(() => {
        onClose();
        resetScan();
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Scan failed",
        description: error.message,
        variant: "destructive",
      });
      setIsScanning(false);
    },
  });

  useEffect(() => {
    if (isOpen) {
      initializeCamera();
      initializeFaceAPI();
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [isOpen]);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus("Camera ready. Position your face in the frame.");
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatus("Unable to access camera. Please check permissions.");
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const resetScan = () => {
    setCountdown(10);
    setIsScanning(false);
    setScanComplete(false);
    setStatus("Click 'Start Scan' to begin");
  };

  const startScan = async () => {
    if (!stream || !videoRef.current) {
      toast({
        title: "Camera not ready",
        description: "Please wait for camera to initialize.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setStatus("Detecting face...");
    
    try {
      // Start countdown
      const scanInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(scanInterval);
            completeScan();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setStatus("Scanning in progress...");
    } catch (error) {
      console.error("Error starting scan:", error);
      setIsScanning(false);
      setStatus("Scan failed. Please try again.");
    }
  };

  const completeScan = async () => {
    try {
      setStatus("Analyzing face...");
      
      // Capture frame from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) throw new Error("Canvas or video not available");
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context not available");
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Convert to base64
      const faceImageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Detect emotion (simulated for now - you can replace with actual face-api.js implementation)
      const emotionResult = await detectFaceAndEmotion(video);
      
      // Generate health metrics
      const healthMetrics = generateHealthMetrics(emotionResult.mood);
      
      // Create health report
      const reportData = {
        ...healthMetrics,
        detectedMood: emotionResult.mood,
        moodConfidence: emotionResult.confidence,
        faceImageData,
        scanDuration: 10,
      };
      
      createHealthReportMutation.mutate(reportData);
      
    } catch (error) {
      console.error("Error completing scan:", error);
      setIsScanning(false);
      setStatus("Analysis failed. Please try again.");
      toast({
        title: "Analysis Error",
        description: "Failed to analyze face data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (!isScanning) {
      onClose();
      resetScan();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">AI Face Scan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Camera Preview */}
          <div className="relative">
            <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning Animation */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="scan-circle w-32 h-32 rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500 mb-2">{countdown}</div>
            <p className="text-gray-600 dark:text-gray-400">seconds remaining</p>
            {isScanning && (
              <Progress value={(10 - countdown) * 10} className="mt-4" />
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              {scanComplete ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : isScanning ? (
                <div className="w-3 h-3 bg-green-500 rounded-full pulse-animation"></div>
              ) : (
                <Camera className="w-5 h-5 text-gray-400" />
              )}
              <span className={`font-medium ${scanComplete ? 'text-green-600' : isScanning ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                {status}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isScanning}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              onClick={startScan}
              disabled={isScanning || !stream || scanComplete}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isScanning ? "Scanning..." : "Start Scan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
