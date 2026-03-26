// Historical analytics - frequency, gaps, distributions
// IMPORTANT: These are interesting data visualizations, NOT predictive tools

export interface FrequencyData {
  number: number;
  count: number;
  percentage: number;
  lastSeen: string | null;
  gap: number; // Draws since last appearance
}

export interface NumberStats {
  frequencies: FrequencyData[];
  totalDraws: number;
  hotNumbers: number[]; // Top 10 most frequent
  coldNumbers: number[]; // Top 10 least frequent
  averageSum: number;
  sumRange: { min: number; max: number; avg: number };
}

export function calculateFrequencies(
  draws: { numbers: string; draw_date: string }[],
  maxNumber: number
): FrequencyData[] {
  const counts: Map<number, { count: number; lastSeen: string | null }> = new Map();
  
  for (let i = 1; i <= maxNumber; i++) {
    counts.set(i, { count: 0, lastSeen: null });
  }

  const totalDraws = draws.length;

  for (const draw of draws) {
    const nums = draw.numbers.split(',').map(n => parseInt(n.trim()));
    for (const num of nums) {
      const entry = counts.get(num);
      if (entry) {
        entry.count++;
        if (!entry.lastSeen || draw.draw_date > entry.lastSeen) {
          entry.lastSeen = draw.draw_date;
        }
      }
    }
  }

  // Calculate gaps (draws since last appearance)
  const latestDraw = draws[0]?.draw_date;
  
  return Array.from(counts.entries()).map(([number, data]) => {
    let gap = totalDraws;
    if (data.lastSeen) {
      // Count draws after last appearance
      gap = draws.findIndex(d => {
        const nums = d.numbers.split(',').map(n => parseInt(n.trim()));
        return nums.includes(number);
      });
      if (gap === -1) gap = totalDraws;
    }

    return {
      number,
      count: data.count,
      percentage: totalDraws > 0 ? (data.count / totalDraws) * 100 : 0,
      lastSeen: data.lastSeen,
      gap,
    };
  });
}

export function getNumberStats(
  draws: { numbers: string; draw_date: string }[],
  maxNumber: number
): NumberStats {
  const frequencies = calculateFrequencies(draws, maxNumber);
  const sorted = [...frequencies].sort((a, b) => b.count - a.count);
  
  // Calculate sum statistics
  const sums = draws.map(d => {
    const nums = d.numbers.split(',').map(n => parseInt(n.trim()));
    return nums.reduce((sum, n) => sum + n, 0);
  });

  const avgSum = sums.length > 0 ? sums.reduce((a, b) => a + b, 0) / sums.length : 0;
  const minSum = sums.length > 0 ? Math.min(...sums) : 0;
  const maxSum = sums.length > 0 ? Math.max(...sums) : 0;

  return {
    frequencies,
    totalDraws: draws.length,
    hotNumbers: sorted.slice(0, 10).map(f => f.number),
    coldNumbers: sorted.slice(-10).reverse().map(f => f.number),
    averageSum: avgSum,
    sumRange: { min: minSum, max: maxSum, avg: avgSum },
  };
}

export function getGapAnalysis(
  draws: { numbers: string; draw_date: string }[],
  maxNumber: number
): { number: number; currentGap: number; maxGap: number; avgGap: number }[] {
  const gaps: Map<number, number[]> = new Map();
  const lastSeen: Map<number, number> = new Map();

  for (let i = 1; i <= maxNumber; i++) {
    gaps.set(i, []);
    lastSeen.set(i, -1);
  }

  for (let drawIdx = 0; drawIdx < draws.length; drawIdx++) {
    const nums = draws[drawIdx].numbers.split(',').map(n => parseInt(n.trim()));
    for (const num of nums) {
      const last = lastSeen.get(num)!;
      if (last >= 0) {
        gaps.get(num)!.push(drawIdx - last);
      }
      lastSeen.set(num, drawIdx);
    }
  }

  return Array.from(gaps.entries()).map(([number, gapList]) => {
    const currentGap = draws.length - (lastSeen.get(number) ?? draws.length);
    const maxGap = gapList.length > 0 ? Math.max(...gapList) : draws.length;
    const avgGap = gapList.length > 0 ? gapList.reduce((a, b) => a + b, 0) / gapList.length : 0;
    
    return { number, currentGap, maxGap, avgGap };
  });
}
