// Health metrics generation and wellness score calculation

export interface HealthMetrics {
  wellnessScore: number;
  heartRate: number;
  oxygenLevel: number;
  bloodSugar: number;
  stressLevel: string;
  energyLevel: string;
}

export function generateHealthMetrics(mood: string): HealthMetrics {
  // Base values
  let baseWellness = 75;
  let baseHeartRate = 75;
  let baseOxygen = 97;
  let baseBloodSugar = 95;
  let stressLevel = 'Medium';
  let energyLevel = 'Normal';

  // Adjust based on detected mood
  switch (mood.toLowerCase()) {
    case 'happy':
      baseWellness += 15;
      baseHeartRate += Math.floor(Math.random() * 10) - 5;
      baseOxygen += Math.floor(Math.random() * 3);
      stressLevel = 'Low';
      energyLevel = 'High';
      break;
      
    case 'sad':
      baseWellness -= 10;
      baseHeartRate += Math.floor(Math.random() * 15) + 5;
      baseOxygen -= Math.floor(Math.random() * 2);
      stressLevel = 'Medium';
      energyLevel = 'Low';
      break;
      
    case 'angry':
      baseWellness -= 15;
      baseHeartRate += Math.floor(Math.random() * 20) + 10;
      baseOxygen -= Math.floor(Math.random() * 3);
      baseBloodSugar += Math.floor(Math.random() * 20) + 10;
      stressLevel = 'High';
      energyLevel = 'High';
      break;
      
    case 'surprised':
      baseWellness += 5;
      baseHeartRate += Math.floor(Math.random() * 15) + 5;
      stressLevel = 'Medium';
      energyLevel = 'High';
      break;
      
    case 'fear':
      baseWellness -= 20;
      baseHeartRate += Math.floor(Math.random() * 25) + 15;
      baseOxygen -= Math.floor(Math.random() * 4);
      baseBloodSugar += Math.floor(Math.random() * 15) + 5;
      stressLevel = 'High';
      energyLevel = 'Low';
      break;
      
    default: // neutral
      baseWellness += Math.floor(Math.random() * 10) - 5;
      baseHeartRate += Math.floor(Math.random() * 10) - 5;
      stressLevel = 'Low';
      energyLevel = 'Normal';
  }

  // Add some randomness for realism
  const wellness = Math.max(0, Math.min(100, baseWellness + Math.floor(Math.random() * 10) - 5));
  const heartRate = Math.max(50, Math.min(120, baseHeartRate + Math.floor(Math.random() * 8) - 4));
  const oxygenLevel = Math.max(85, Math.min(100, baseOxygen + Math.floor(Math.random() * 4) - 2));
  const bloodSugar = Math.max(60, Math.min(180, baseBloodSugar + Math.floor(Math.random() * 20) - 10));

  return {
    wellnessScore: wellness,
    heartRate,
    oxygenLevel,
    bloodSugar,
    stressLevel,
    energyLevel,
  };
}

export function calculateWellnessScore(metrics: Partial<HealthMetrics>): number {
  let score = 0;
  let factors = 0;

  if (metrics.heartRate) {
    // Heart rate score (60-100 bpm is optimal)
    if (metrics.heartRate >= 60 && metrics.heartRate <= 100) {
      score += 25;
    } else if (metrics.heartRate >= 50 && metrics.heartRate <= 120) {
      score += 15;
    } else {
      score += 5;
    }
    factors++;
  }

  if (metrics.oxygenLevel) {
    // Oxygen level score (95%+ is excellent)
    if (metrics.oxygenLevel >= 95) {
      score += 25;
    } else if (metrics.oxygenLevel >= 90) {
      score += 15;
    } else {
      score += 5;
    }
    factors++;
  }

  if (metrics.bloodSugar) {
    // Blood sugar score (70-140 mg/dL is normal)
    if (metrics.bloodSugar >= 70 && metrics.bloodSugar <= 140) {
      score += 25;
    } else if (metrics.bloodSugar >= 60 && metrics.bloodSugar <= 180) {
      score += 15;
    } else {
      score += 5;
    }
    factors++;
  }

  if (metrics.stressLevel) {
    // Stress level score
    switch (metrics.stressLevel.toLowerCase()) {
      case 'low':
        score += 25;
        break;
      case 'medium':
        score += 15;
        break;
      case 'high':
        score += 5;
        break;
    }
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 0;
}

export function getHealthRecommendations(metrics: HealthMetrics): string[] {
  const recommendations: string[] = [];

  // Heart rate recommendations
  if (metrics.heartRate > 100) {
    recommendations.push("Consider relaxation techniques to lower your heart rate.");
  } else if (metrics.heartRate < 60) {
    recommendations.push("Light exercise could help improve your cardiovascular health.");
  }

  // Oxygen level recommendations
  if (metrics.oxygenLevel < 95) {
    recommendations.push("Practice deep breathing exercises to improve oxygen levels.");
  }

  // Blood sugar recommendations
  if (metrics.bloodSugar > 140) {
    recommendations.push("Monitor your diet and consider reducing sugar intake.");
  } else if (metrics.bloodSugar < 70) {
    recommendations.push("Consider eating a healthy snack to stabilize blood sugar.");
  }

  // Stress level recommendations
  if (metrics.stressLevel === 'High') {
    recommendations.push("Try meditation or stress-reduction techniques.");
  }

  // Energy level recommendations
  if (metrics.energyLevel === 'Low') {
    recommendations.push("Ensure you're getting adequate sleep and nutrition.");
  }

  // Default recommendations if none specific
  if (recommendations.length === 0) {
    recommendations.push("Maintain your current healthy lifestyle!");
    recommendations.push("Stay hydrated and get regular exercise.");
  }

  return recommendations;
}
