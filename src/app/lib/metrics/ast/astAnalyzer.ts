import { Parser } from 'acorn';
import { analyzeTreeStructure } from './treeStructure';
import { analyzeNodeTypes } from './nodeTypes';
import { calculateCyclomaticComplexity } from './cyclomaticComplexity';
import { AST } from '../../types';

type ParseError = {
  kind: 'ParseError';
  message: string;
  position?: { line: number; column: number };
};
// Результат операции: либо успех с данными, либо явная ошибка
type Result<T, E> = { kind: 'success'; value: T } | { kind: 'failure'; error: E };

// Результат анализа – метрики (то, что доказываем)
type Analysis = {
  astDepth: number;
  astBranchingFactor: number;
  astDiversity: number;
  cyclomaticComplexity: number;
};

// ======================
// 2. Чистые примитивы (доказательства нижнего уровня)
// ======================

function isAST(value: unknown): value is AST {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    typeof (value as any).type === 'string' &&
    'body' in value &&
    Array.isArray((value as any).body)
    // добавьте необходимые проверки для вашего AST
  );
}

// Лемма: безопасный парсинг без исключений
function safeParse(code: string): Result<AST, ParseError> {
  try {
    const rawAst = Parser.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ranges: true,
      locations: true,
    });

    // Теперь доказываем, что это действительно AST
    if (isAST(rawAst)) {
      return { kind: 'success', value: rawAst };
    } else {
      // Парсер вернул объект, не соответствующий ожидаемой структуре
      return {
        kind: 'failure',
        error: { kind: 'ParseError', message: 'Parsed object does not conform to AST shape' },
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      kind: 'failure',
      error: { kind: 'ParseError', message },
    };
  }
}

// Лемма: вычисление анализа из AST (чистая функция)
function computeAnalysis(ast: AST): Analysis {
  const { maxDepth, nodeCount, totalChildren } = analyzeTreeStructure(ast);
  const { nodeTypes } = analyzeNodeTypes(ast);
  const cyclomaticComplexity = calculateCyclomaticComplexity(ast);

  return {
    astDepth: maxDepth,
    astBranchingFactor: nodeCount > 0 ? totalChildren / nodeCount : 0,
    astDiversity: nodeTypes.size,
    cyclomaticComplexity,
  };
}

// ======================
// 3. Теорема: анализ кода возвращает доказательный результат
// ======================
export function analyzeAST(code: string): Result<Analysis, ParseError> {
  const parseResult = safeParse(code);
  if (parseResult.kind === 'failure') {
    return parseResult; // проброс ошибки без изменения
  }
  const analysis = computeAnalysis(parseResult.value);
  return { kind: 'success', value: analysis };
}
