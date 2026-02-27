export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEth(value: string): string {
  const num = parseFloat(value);
  return num.toFixed(2);
}

export function getTimeRemaining(deadline: number | string | Date): { days: number; hours: number; minutes: number; expired: boolean } {
  const deadlineMs = typeof deadline === 'number' ? deadline : new Date(deadline).getTime();
  const diff = deadlineMs - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    expired: false,
  };
}

export function getProgress(collected: string, target: string): number {
  return Math.min(100, (parseFloat(collected) / parseFloat(target)) * 100);
}
