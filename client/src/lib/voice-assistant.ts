import type { HealthReport } from "@shared/schema";

export function readReportAloud(report: HealthReport): void {
  if (!('speechSynthesis' in window)) {
    console.error("Speech synthesis not supported in this browser");
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const text = generateReportText(report);
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.8;
  utterance.pitch = 1;
  utterance.volume = 0.8;
  
  // Try to use a more natural voice if available
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Google') || 
    voice.name.includes('Microsoft') ||
    voice.lang.startsWith('en')
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    console.log("Starting to read health report");
  };
  
  utterance.onend = () => {
    console.log("Finished reading health report");
  };
  
  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event.error);
  };

  speechSynthesis.speak(utterance);
}

function generateReportText(report: HealthReport): string {
  const date = new Date(report.createdAt).toLocaleDateString();
  
  const text = `
    Health Report for ${date}.
    
    Your overall wellness score is ${report.wellnessScore} out of 100.
    
    Here are your vital signs:
    Your heart rate is ${report.heartRate} beats per minute, which is ${getHeartRateStatus(report.heartRate)}.
    Your oxygen level is ${report.oxygenLevel} percent SpO2, which is ${getOxygenStatus(report.oxygenLevel)}.
    Your blood sugar level is ${report.bloodSugar} milligrams per deciliter, which is ${getBloodSugarStatus(report.bloodSugar)}.
    
    Your stress level is currently ${report.stressLevel.toLowerCase()}.
    Your energy level is ${report.energyLevel.toLowerCase()}.
    
    Our AI detected that your mood is ${report.detectedMood} with ${report.moodConfidence} percent confidence.
    
    ${getHealthAdvice(report)}
    
    Remember to stay hydrated, get adequate sleep, and maintain regular exercise.
    This concludes your health report.
  `;
  
  return text.replace(/\s+/g, ' ').trim();
}

function getHeartRateStatus(heartRate: number): string {
  if (heartRate >= 60 && heartRate <= 100) return "normal";
  if (heartRate < 60) return "below normal";
  return "above normal";
}

function getOxygenStatus(oxygenLevel: number): string {
  if (oxygenLevel >= 95) return "excellent";
  if (oxygenLevel >= 90) return "good";
  return "below optimal";
}

function getBloodSugarStatus(bloodSugar: number): string {
  if (bloodSugar >= 70 && bloodSugar <= 140) return "within normal range";
  if (bloodSugar < 70) return "below normal";
  return "above normal";
}

function getHealthAdvice(report: HealthReport): string {
  const advice = [];
  
  if (report.stressLevel.toLowerCase() === 'high') {
    advice.push("Consider practicing relaxation techniques to reduce stress.");
  }
  
  if (report.energyLevel.toLowerCase() === 'low') {
    advice.push("Make sure you're getting enough rest and nutrition.");
  }
  
  if (report.heartRate > 100) {
    advice.push("Your heart rate is elevated. Consider taking some time to relax.");
  }
  
  if (report.oxygenLevel < 95) {
    advice.push("Practice deep breathing exercises to improve oxygen levels.");
  }
  
  if (advice.length === 0) {
    advice.push("Your health metrics look good. Keep up the great work!");
  }
  
  return advice.join(" ");
}

export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

export function pauseSpeech(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.pause();
  }
}

export function resumeSpeech(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.resume();
  }
}
