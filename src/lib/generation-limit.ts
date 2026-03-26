const STORAGE_KEY = 'lm3k_gen_count';
const MAX_FREE_GENERATIONS = 3;

interface GenTracker {
  date: string;
  count: number;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getGenerationCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const data: GenTracker = JSON.parse(raw);
    if (data.date !== getToday()) return 0;
    return data.count;
  } catch {
    return 0;
  }
}

export function incrementGenerationCount(): number {
  const today = getToday();
  const current = getGenerationCount();
  const newCount = current + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
  return newCount;
}

export function canGenerate(): boolean {
  return getGenerationCount() < MAX_FREE_GENERATIONS;
}

export function remainingGenerations(): number {
  return Math.max(0, MAX_FREE_GENERATIONS - getGenerationCount());
}

export const MAX_FREE_GENS = MAX_FREE_GENERATIONS;
