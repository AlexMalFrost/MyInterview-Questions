import { tokenizeCode } from '../utils/tokenizer';
import { freqValues, formulaShannonEntropy } from '../utils/frequencies';

export function calculateTokenEntropy(code: string): number {
  const tokens = tokenizeCode(code);
  if (tokens.length <= 1) return 0;
  return formulaShannonEntropy(freqValues(tokens), tokens.length) || 0;
}
