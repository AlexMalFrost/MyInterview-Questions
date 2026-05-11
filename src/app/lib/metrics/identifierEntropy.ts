import { jsKeywords } from '../utils/keywords';
import { freqValues, formulaShannonEntropy } from '../utils/frequencies';

export function calculateIdentifierEntropy(code: string): number {
  const identifiers = code.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  const filteredIdentifiers = identifiers.filter((id) => !jsKeywords.has(id));
  if (filteredIdentifiers.length <= 1) return 0;
  return formulaShannonEntropy(freqValues(filteredIdentifiers), filteredIdentifiers.length) || 0;
}
