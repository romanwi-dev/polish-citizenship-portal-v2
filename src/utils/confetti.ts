import confetti from "canvas-confetti";

export const celebrateStatusChange = (status: string) => {
  // Different celebrations for different status types
  switch (status) {
    case 'completed':
    case 'finished':
      // Big celebration for completion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#4ade80']
      });
      break;
    
    case 'in_progress':
    case 'processing':
      // Moderate celebration for progress
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd']
      });
      break;
    
    case 'approved':
      // Success celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
      });
      break;
    
    default:
      // Small celebration for other status changes
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 }
      });
  }
};

export const celebrateCompletion = () => {
  // Special fireworks effect for major completions
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};
