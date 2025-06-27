import * as faceapi from 'face-api.js';

export interface EmotionResult {
  mood: string;
  confidence: number;
}

export async function detectFaceAndEmotion(video: HTMLVideoElement): Promise<EmotionResult> {
  try {
    // Detect face and expressions
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    
    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      
      // Get the dominant emotion
      const emotionEntries = Object.entries(expressions);
      const [dominantEmotion, confidence] = emotionEntries.reduce((max, current) => 
        current[1] > max[1] ? current : max
      );
      
      return {
        mood: dominantEmotion,
        confidence: Math.round(confidence * 100)
      };
    }
    
    // Fallback if no face detected
    return {
      mood: 'neutral',
      confidence: 50
    };
    
  } catch (error) {
    console.error('Error in face detection:', error);
    
    // Return default values on error
    return {
      mood: 'neutral',
      confidence: 75
    };
  }
}

export async function initializeFaceAPI() {
  try {
    // Load models from CDN
    const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    console.log('Face-api.js models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    return false;
  }
}
