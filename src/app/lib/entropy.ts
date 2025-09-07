// Ключевые слова в JavaScript
const jsKeywords = new Set([
  'function',
  'const',
  'let',
  'var',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'class',
  'extends',
  'new',
  'this',
  'super',
  'import',
  'export',
  'default',
  'async',
  'await',
  'yield',
  'in',
  'instanceof',
  'typeof',
  'void',
  'delete',
  'try',
  'catch',
  'finally',
  'throw',
  'with',
  'debugger',
]);

export interface CodeEntropyMetrics {
  shannonEntropy: number; // Энтропия на уровне символов
  tokenEntropy: number; // Энтропия на уровне токенов
  identifierEntropy: number; // Энтропия имен переменных
  characterVariety: number;
  duplicateLinesPercentage: number;
  averageLineLength: number;
}

function freqValues(val: string[]) {
  const frequencies: Record<string, number> = {};
  val.forEach((id) => {
    frequencies[id] = (frequencies[id] || 0) + 1;
  });
  return frequencies;
}

function formulaShannonEntropy(frequencies: Record<string, number>, total: number): number {
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

export function calculateShannonEntropy(input: string): number {
  // Handle edge cases
  if (!input || input.length <= 1) return 0;

  // Create a frequency map of characters
  const frequencies: Record<string, number> = {};

  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i);
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  // Calculate entropy using Shannon's formula
  return formulaShannonEntropy(frequencies, input.length) || 0;
}

/**
 * Analyze JavaScript code for common entropy-related metrics
 * @param code JavaScript code to analyze
 * @returns Object with multiple entropy metrics
 */

function removeComments(code: string): string {
  // Регулярное выражение для удаления многострочных комментариев (/* ... */)
  // Регулярное выражение для удаления однострочных комментариев (// ...)
  // Игнорируем комментарии внутри строк (хотя это не идеально, но покрывает основные случаи)
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!["'])\/\/.*/g, '');
}

function tokenizeCode(code: string): string[] {
  // Регулярное выражение для извлечения токенов:
  // - Идентификаторы и ключевые слова: [a-zA-Z_][a-zA-Z0-9_]*
  // - Числа: \d+
  // - Специальные символы (операторы, скобки и т.д.): [\{\}\(\)\[\];,\.+\-*/=<>!&|?:]+
  const tokens =
    code.match(
      /[a-zA-Z_$][\w$]*|`[^`]*`|\d+\.?\d*|=>|\.{2,3}|[\?\!]\.?|[\+\-\*\/%=,;:{}()[\]]+/g,
    ) || [];
  return tokens;
}

export function analyzeCodeEntropy(code: string): CodeEntropyMetrics {
  // Calculate Shannon entropy
  const codeWithoutComments = removeComments(code);

  if (!codeWithoutComments.trim()) {
    return {
      shannonEntropy: 0,
      tokenEntropy: 0,
      identifierEntropy: 0,
      characterVariety: 0,
      duplicateLinesPercentage: 0,
      averageLineLength: 0,
    };
  }

  const shannonEntropy = calculateShannonEntropy(codeWithoutComments);

  // Calculate character variety (unique chars / total chars)
  const uniqueChars = new Set(codeWithoutComments).size;
  const characterVariety =
    codeWithoutComments.length > 0 ? uniqueChars / codeWithoutComments.length : 0;

  // Calculate duplicate lines percentage
  const lines = codeWithoutComments.split('\n').filter((line) => line.trim().length > 0);
  const uniqueLines = new Set(lines);
  const duplicateLinesPercentage =
    lines.length > 0 ? ((lines.length - uniqueLines.size) / lines.length) * 100 : 0;

  // Calculate average line length
  const averageLineLength =
    lines.length > 0 ? lines.reduce((sum, line) => sum + line.length, 0) / lines.length : 0;

  const tokenEntropy = calculateTokenEntropy(codeWithoutComments);
  const identifierEntropy = calculateIdentifierEntropy(codeWithoutComments);

  return {
    shannonEntropy,
    tokenEntropy,
    identifierEntropy,
    characterVariety,
    duplicateLinesPercentage,
    averageLineLength,
  };
}

export function calculateTokenEntropy(code: string): number {
  const tokens = tokenizeCode(code);

  // Обработка крайних случаев
  if (tokens.length <= 1) return 0;

  // Подсчет частоты каждого токена
  // Расчет энтропии
  return formulaShannonEntropy(freqValues(tokens), tokens.length) || 0;
}

export function calculateIdentifierEntropy(code: string): number {
  // Извлекаем только идентификаторы (исключая ключевые слова)
  const identifiers = code.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

  const filteredIdentifiers = identifiers.filter((id) => !jsKeywords.has(id));

  // Если нет идентификаторов, возвращаем 0
  if (filteredIdentifiers.length <= 1) return 0;

  return formulaShannonEntropy(freqValues(filteredIdentifiers), filteredIdentifiers.length) || 0;
}
