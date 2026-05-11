import { formulaShannonEntropy } from '../utils/frequencies';

export function calculateShannonEntropy(input: string): number {
  if (!input || input.length <= 1) return 0;
  const frequencies: Record<string, number> = {};
  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i);
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  return formulaShannonEntropy(frequencies, input.length) || 0;
}
