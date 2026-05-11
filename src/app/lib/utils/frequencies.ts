export function freqValues(val: string[]): Record<string, number> {
  const frequencies: Record<string, number> = {};
  val.forEach((id) => {
    frequencies[id] = (frequencies[id] || 0) + 1;
  });
  return frequencies;
}

export function formulaShannonEntropy(frequencies: Record<string, number>, total: number): number {
  if (total <= 1) return 0;
  let entropy = 0;
  for (const item in frequencies) {
    const probability = frequencies[item] / total;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }
  return entropy;
}
