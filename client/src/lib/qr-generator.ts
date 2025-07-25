import type { HealthReport } from "@shared/schema";

export async function generateQRCode(report: HealthReport): Promise<void> {
  try {
    // @ts-ignore - QRCode is loaded globally
    if (typeof QRCode === 'undefined') {
      throw new Error("QR Code library not loaded");
    }

    // Create shareable report data (without sensitive information)
    const shareableData = {
      wellnessScore: report.wellnessScore,
      heartRate: report.heartRate,
      oxygenLevel: report.oxygenLevel,
      stressLevel: report.stressLevel,
      energyLevel: report.energyLevel,
      detectedMood: report.detectedMood,
      moodConfidence: report.moodConfidence,
      date: new Date(report.createdAt).toLocaleDateString(),
      // Note: We exclude blood sugar and face image for privacy
    };

    // Create a shareable URL or JSON string
    const shareableText = `AI Health Monitor Report
Date: ${shareableData.date}
Wellness Score: ${shareableData.wellnessScore}/100
Heart Rate: ${shareableData.heartRate} bpm
Oxygen Level: ${shareableData.oxygenLevel}%
Stress Level: ${shareableData.stressLevel}
Energy Level: ${shareableData.energyLevel}
Mood: ${shareableData.detectedMood} (${shareableData.moodConfidence}% confidence)

Generated by AI Health Monitor`;

    // Create canvas element for QR code
    const canvas = document.createElement('canvas');
    
    // Generate QR code
    // @ts-ignore
    await QRCode.toCanvas(canvas, shareableText, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `health-report-qr-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Also show QR code in a modal or new window
    showQRCodeModal(canvas.toDataURL());

  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

function showQRCodeModal(qrDataUrl: string): void {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: pointer;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
    max-width: 90vw;
    max-height: 90vh;
    cursor: default;
  `;

  // Create QR code image
  const img = document.createElement('img');
  img.src = qrDataUrl;
  img.style.cssText = `
    max-width: 300px;
    max-height: 300px;
    margin-bottom: 1rem;
  `;

  // Create title
  const title = document.createElement('h3');
  title.textContent = 'Share Your Health Report';
  title.style.cssText = `
    margin-bottom: 1rem;
    color: #374151;
    font-size: 1.25rem;
    font-weight: 600;
  `;

  // Create description
  const description = document.createElement('p');
  description.textContent = 'Scan this QR code to view the health report summary';
  description.style.cssText = `
    color: #6B7280;
    margin-bottom: 1rem;
  `;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = `
    background: #3B82F6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
  `;

  // Add event listeners
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });

  modal.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Assemble modal
  modal.appendChild(title);
  modal.appendChild(img);
  modal.appendChild(description);
  modal.appendChild(closeButton);
  overlay.appendChild(modal);

  // Add to page
  document.body.appendChild(overlay);

  // Remove after 30 seconds
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  }, 30000);
}

export async function shareViaQR(data: any): Promise<string> {
  try {
    // @ts-ignore
    if (typeof QRCode === 'undefined') {
      throw new Error("QR Code library not loaded");
    }

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // @ts-ignore
    const qrDataUrl = await QRCode.toDataURL(dataString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrDataUrl;
  } catch (error) {
    console.error("Error creating QR code:", error);
    throw new Error("Failed to create QR code");
  }
}
