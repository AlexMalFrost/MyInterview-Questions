import { removeComments } from '../utils/comments';
import { calculateShannonEntropy } from './shannonEntropy';
import { calculateTokenEntropy } from './tokenEntropy';
import { calculateIdentifierEntropy } from './identifierEntropy';
import { analyzeAST } from './ast/astAnalyzer';
import { CodeEntropyMetrics } from '../types';

function toNumber(value: unknown, fallback: number = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
}

export function analyzeCodeEntropy(code: string): CodeEntropyMetrics {
  const codeWithoutComments = removeComments(code) ?? '';
  if (codeWithoutComments.trim() === '') {
    return {
      shannonEntropy: 0,
      tokenEntropy: 0,
      identifierEntropy: 0,
      characterVariety: 0,
      duplicateLinesPercentage: 0,
      averageLineLength: 0,
      astDepth: 0,
      astBranchingFactor: 0,
      astDiversity: 0,
      cyclomaticComplexity: 0,
    };
  }

  const astMetrics = analyzeAST(codeWithoutComments);
  let astDepth = 0,
    astBranchingFactor = 0,
    astDiversity = 0,
    cyclomaticComplexity = 0;
  if (astMetrics.kind === 'success') {
    astDepth = toNumber(astMetrics.value.astDepth);
    astBranchingFactor = toNumber(astMetrics.value.astBranchingFactor);
    astDiversity = toNumber(astMetrics.value.astDiversity);
    cyclomaticComplexity = toNumber(astMetrics.value.cyclomaticComplexity, 1);
  }
  const shannonEntropy = toNumber(calculateShannonEntropy(codeWithoutComments));

  const uniqueChars = new Set(codeWithoutComments).size;
  const characterVariety =
    codeWithoutComments.length > 0 ? uniqueChars / codeWithoutComments.length : 0;

  const lines = codeWithoutComments.split('\n').filter((line) => line.trim().length > 0);
  const uniqueLines = new Set(lines);
  const duplicateLinesPercentage =
    lines.length > 0 ? ((lines.length - uniqueLines.size) / lines.length) * 100 : 0;
  const averageLineLength =
    lines.length > 0 ? lines.reduce((sum, line) => sum + line.length, 0) / lines.length : 0;

  const tokenEntropy = toNumber(calculateTokenEntropy(codeWithoutComments));
  const identifierEntropy = toNumber(calculateIdentifierEntropy(codeWithoutComments));

  return {
    shannonEntropy,
    tokenEntropy,
    identifierEntropy,
    characterVariety,
    duplicateLinesPercentage,
    averageLineLength,
    astDepth,
    astBranchingFactor,
    astDiversity,
    cyclomaticComplexity,
  };
}
