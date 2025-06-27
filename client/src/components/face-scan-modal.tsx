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
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceBox, setFaceBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setFaceDetected(false);
    setFaceBox(null);
  };

  const startFaceDetection = async () => {
    if (!videoRef.current || !overlayCanvasRef.current) return;
    
    const video = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = overlayCanvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas size to match video
    overlayCanvas.width = video.videoWidth || 640;
    overlayCanvas.height = video.videoHeight || 480;
    
    detectionIntervalRef.current = setInterval(async () => {
      if (!video || video.readyState !== 4) return;
      
      try {
        // Import face-api dynamically to detect faces
        const faceapi = await import('face-api.js');
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
        
        // Clear previous drawings
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        if (detections.length > 0) {
          const detection = detections[0];
          const box = detection.box;
          
          setFaceDetected(true);
          setFaceBox({ x: box.x, y: box.y, width: box.width, height: box.height });
          
          // Draw face detection box with scanning animation
          drawFaceOverlay(ctx, box);
        } else {
          setFaceDetected(false);
          setFaceBox(null);
        }
      } catch (error) {
        console.log('Face detection not ready yet');
      }
    }, 100); // Update 10 times per second
  };
  
  const drawFaceOverlay = (ctx: CanvasRenderingContext2D, box: any) => {
    const time = Date.now();
    
    // Draw face border
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    
    // Draw corner markers
    const cornerLength = 20;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + cornerLength);
    ctx.lineTo(box.x, box.y);
    ctx.lineTo(box.x + cornerLength, box.y);
    ctx.stroke();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(box.x + box.width - cornerLength, box.y);
    ctx.lineTo(box.x + box.width, box.y);
    ctx.lineTo(box.x + box.width, box.y + cornerLength);
    ctx.stroke();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + box.height - cornerLength);
    ctx.lineTo(box.x, box.y + box.height);
    ctx.lineTo(box.x + cornerLength, box.y + box.height);
    ctx.stroke();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(box.x + box.width - cornerLength, box.y + box.height);
    ctx.lineTo(box.x + box.width, box.y + box.height);
    ctx.lineTo(box.x + box.width, box.y + box.height - cornerLength);
    ctx.stroke();
    
    // Draw scanning line
    const scanProgress = ((time / 50) % 100) / 100; // Move every 50ms
    const scanY = box.y + (box.height * scanProgress);
    
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(box.x, scanY);
    ctx.lineTo(box.x + box.width, scanY);
    ctx.stroke();
    
    // Draw detection dots around the face
    ctx.fillStyle = '#00ff00';
    const dotPositions = [
      { x: box.x + box.width * 0.2, y: box.y + box.height * 0.3 }, // Left eye area
      { x: box.x + box.width * 0.8, y: box.y + box.height * 0.3 }, // Right eye area
      { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 }, // Nose area
      { x: box.x + box.width * 0.5, y: box.y + box.height * 0.7 }, // Mouth area
      { x: box.x + box.width * 0.3, y: box.y + box.height * 0.8 }, // Left mouth corner
      { x: box.x + box.width * 0.7, y: box.y + box.height * 0.8 }, // Right mouth corner
    ];
    
    dotPositions.forEach((dot, index) => {
      const pulseOffset = (time / 200 + index * 0.5) % (Math.PI * 2);
      const radius = 3 + Math.sin(pulseOffset) * 1;
      
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
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
    
    // Start face detection overlay
    await startFaceDetection();
    
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
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
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
            <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Face Detection Overlay Canvas */}
              <canvas 
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ mixBlendMode: 'screen' }}
              />
              
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Face Detection Status */}
              {isScanning && (
                <div className="absolute top-2 right-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    faceDetected 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-black'
                  }`}>
                    {faceDetected ? 'Face Detected' : 'Looking for face...'}
                  </div>
                </div>
              )}
              
              {/* Scanning Grid Animation */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="scanning-grid"></div>
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
