import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#E6B400', '#ffd700', '#000000', '#22c55e', '#ffffff']
  });
};

export const triggerGoldShower = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 40 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#E6B400', '#ffd700', '#ffffff', '#000000'] });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#E6B400', '#ffd700', '#ffffff', '#000000'] });
  }, 250);
};

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
