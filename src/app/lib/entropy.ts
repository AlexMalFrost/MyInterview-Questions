import { Parser } from 'acorn';

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

type Analysis = {
  astDepth: number;
  astBranchingFactor: number;
  astDiversity: number;
  cyclomaticComplexity: number;
};

export interface CodeEntropyMetrics {
  // Существующие метрики
  shannonEntropy: number; // Энтропия на уровне символов
  tokenEntropy: number; // Энтропия на уровне токенов
  identifierEntropy: number; // Энтропия имен переменных
  characterVariety: number;
  duplicateLinesPercentage: number;
  averageLineLength: number;

  // Новые метрики AST
  astDepth: number; // Максимальная глубина AST
  astBranchingFactor: number; // Среднее ветвление в AST
  astDiversity: number; // Разнообразие синтаксических конструкций
  cyclomaticComplexity: number; // Цикломатическая сложность
}

/**
 * Анализирует структуру кода через AST
 * @param code JavaScript код для анализа
 * @returns Метрики структурной сложности
 */
export function analyzeAST(code: string): Analysis {
  try {
    // Парсим код в AST
    const ast = Parser.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ranges: true,
      locations: true,
    });

    // 1. Анализ глубины дерева
    const { maxDepth, nodeCount, totalChildren } = analyzeTreeStructure(ast);

    // 2. Анализ разнообразия конструкций
    const { nodeTypes, controlFlowNodes } = analyzeNodeTypes(ast);

    // 3. Расчет цикломатической сложности (обновленная версия)
    const cyclomaticComplexity = calculateCyclomaticComplexity(ast);

    return {
      astDepth: maxDepth,
      astBranchingFactor: nodeCount > 0 ? totalChildren / nodeCount : 0,
      astDiversity: nodeTypes.size,
      cyclomaticComplexity,
    };
  } catch (e) {
    // В случае ошибки парсинга возвращаем нулевые значения
    console.warn('AST parsing error:', e);
    return {
      astDepth: 0,
      astBranchingFactor: 0,
      astDiversity: 0,
      cyclomaticComplexity: 0,
    };
  }
}

/**
 * Анализирует структуру дерева AST
 */
function analyzeTreeStructure(ast: any) {
  let maxDepth = 0;
  let nodeCount = 0;
  let totalChildren = 0;

  const METADATA_KEYS = new Set([
    'type',
    'start',
    'end',
    'loc',
    'range',
    'source',
    'comments',
    'tokens',
  ]);

  function traverse(node: any, depth: number) {
    if (!node || typeof node !== 'object') return;

    nodeCount++;
    maxDepth = Math.max(maxDepth, depth);

    // Подсчитываем дочерние узлы
    let childrenCount = 0;
    for (const key in node) {
      if (METADATA_KEYS.has(key)) continue;

      const child = node[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          childrenCount += child.length;
          child.forEach((item) => {
            if (item && typeof item === 'object') {
              traverse(item, depth + 1);
            }
          });
        } else {
          childrenCount++;
          traverse(child, depth + 1);
        }
      }
    }

    totalChildren += childrenCount;
  }

  traverse(ast, 1);

  return { maxDepth, nodeCount, totalChildren };
}

/**
 * Анализирует типы узлов AST
 */
function analyzeNodeTypes(ast: any) {
  const nodeTypes = new Set<string>();
  const controlFlowNodes = {
    conditions: 0, // if, else, ternary
    loops: 0, // for, while, do-while
    switches: 0, // switch
    exceptions: 0, // try, catch, throw
    functions: 0, // function declarations
  };

  function collectTypes(node: any) {
    if (node && typeof node === 'object') {
      if (node.type) {
        nodeTypes.add(node.type);

        // Считаем элементы контроля потока
        switch (node.type) {
          case 'IfStatement':
          case 'ConditionalExpression':
            controlFlowNodes.conditions++;
            break;
          case 'ForStatement':
          case 'WhileStatement':
          case 'DoWhileStatement':
          case 'ForOfStatement':
          case 'ForInStatement':
            controlFlowNodes.loops++;
            break;
          case 'SwitchStatement':
            controlFlowNodes.switches++;
            break;
          case 'TryStatement':
          case 'ThrowStatement':
            controlFlowNodes.exceptions++;
            break;
          case 'FunctionDeclaration':
          case 'ArrowFunctionExpression':
          case 'FunctionExpression':
            controlFlowNodes.functions++;
            break;
        }
      }

      // Рекурсивно обходим все свойства
      for (const key in node) {
        if (['type', 'start', 'end'].includes(key)) continue;

        const child = node[key];
        if (child && typeof child === 'object') {
          if (Array.isArray(child)) {
            child.forEach((item) => collectTypes(item));
          } else {
            collectTypes(child);
          }
        }
      }
    }
  }

  collectTypes(ast);

  return { nodeTypes, controlFlowNodes };
}

/**
 * РАСЧЕТ ЦИКЛОМАТИЧЕСКОЙ СЛОЖНОСТИ ПО КЛАССИЧЕСКОМУ ОПРЕДЕЛЕНИЮ
 *
 * Формула: M = E - N + 2P, где
 * E = количество ребер в графе потока управления
 * N = количество узлов в графе потока управления
 * P = количество компонент связности (обычно 1 для функции)
 *
 * Упрощенная интерпретация:
 * - Базовая сложность = 1 (минимальное количество линейных путей)
 * - +1 за каждое условие (if, while, for и т.д.)
 * - +1 за каждый логический оператор (&&, ||) внутри условия
 * - +1 за каждый case в switch (кроме default)
 * - +1 за каждый catch в try/catch
 */
function calculateCyclomaticComplexity(ast: any): number {
  let complexity = 1; // Базовая сложность (минимальное количество путей)

  /**
   * Вспомогательная функция для подсчета логических операторов в условиях
   * Каждый оператор && или || добавляет +1 к сложности
   */
  function countLogicalOperators(node: any) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'LogicalExpression') {
      complexity++; // Каждый оператор && или || добавляет +1 к сложности
      countLogicalOperators(node.left);
      countLogicalOperators(node.right);
    }
  }

  /**
   * Основная функция рекурсивного обхода AST
   */
  function traverse(node: any) {
    if (!node || typeof node !== 'object') return;

    // 1. Условные операторы (If, While, For и т.д.)
    const isConditional = [
      'IfStatement',
      'WhileStatement',
      'DoWhileStatement',
      'ForStatement',
      'ForInStatement',
      'ForOfStatement',
    ].includes(node.type);

    if (isConditional) {
      complexity++; // Базовое условие

      // Подсчет логических операторов внутри условия
      if (node.test) {
        countLogicalOperators(node.test);
      }
    }

    // 2. Тернарные операторы
    if (node.type === 'ConditionalExpression') {
      complexity++;
      if (node.test) {
        countLogicalOperators(node.test);
      }
    }

    // 3. Switch-операторы (каждый case добавляет +1, кроме default)
    if (node.type === 'SwitchStatement' && node.cases) {
      // Каждый case (кроме default) добавляет +1
      complexity += node.cases.filter((c: any) => c.test).length;
    }

    // 4. Обработка исключений
    if (node.type === 'TryStatement') {
      if (node.handler) complexity++; // catch добавляет +1
      if (node.finalizer) complexity++; // finally добавляет +1
    }

    // 5. Рекурсивный обход всех дочерних узлов
    for (const key in node) {
      if (['type', 'start', 'end'].includes(key)) continue;

      const child = node[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          child.forEach(traverse);
        } else {
          traverse(child);
        }
      }
    }
  }

  // Запускаем обход с корневого узла
  traverse(ast);
  return complexity;
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
      astDepth: 0,
      astBranchingFactor: 0,
      astDiversity: 0,
      cyclomaticComplexity: 0,
    };
  }

  // Анализируем структуру кода через AST
  const astMetrics = analyzeAST(codeWithoutComments);

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
    astDepth: astMetrics.astDepth,
    astBranchingFactor: astMetrics.astBranchingFactor,
    astDiversity: astMetrics.astDiversity,
    cyclomaticComplexity: astMetrics.cyclomaticComplexity,
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
