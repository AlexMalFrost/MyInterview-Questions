'use client';

import { useState, useMemo } from 'react';
import { analyzeCodeEntropy, CodeEntropyMetrics } from '@/app/lib/index';

export default function CodeEntropyAnalyzer() {
  const [code, setCode] = useState<string>(SAMPLE_CODE);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const result = useMemo<CodeEntropyMetrics | null>(() => {
    if (!code.trim()) return null;

    setIsAnalyzing(true);
    try {
      const start = performance.now();
      const metrics = analyzeCodeEntropy(code);
      const duration: number = performance.now() - start;

      console.log(`Entropy calculation took ${duration.toFixed(2)} ms`);
      return metrics;
    } finally {
      setIsAnalyzing(false);
    }
  }, [code]);

  const getEntropyLevel = (entropy: number): string => {
    if (entropy < 2.5) return 'Низкая';
    if (entropy < 4.0) return 'Средняя';
    return 'Высокая';
  };

  const getEntropyColor = (entropy: number): string => {
    if (entropy < 2.5) return 'text-green-600';
    if (entropy < 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAstDepthInterpretation = (astDepth: number): string => {
    if (astDepth < 5) return 'Низкая глубина: простая, плоская структура кода';
    if (astDepth < 10) return 'Средняя глубина: умеренная вложенность, хорошая читаемость';
    return 'Высокая глубина: сложная вложенная структура, может быть трудна для понимания';
  };

  const getBranchingFactorInterpretation = (factor: number): string => {
    if (factor < 1.5) return 'Низкое ветвление: линейная структура, простой поток выполнения';
    if (factor < 2.5) return 'Среднее ветвление: здоровый баланс между структурой и сложностью';
    return 'Высокое ветвление: сложная структура с множеством ветвлений, может быть трудна для тестирования';
  };

  const getCyclomaticComplexityInterpretation = (complexity: number): string => {
    if (complexity <= 5) return 'Низкая сложность: очень простой код, легко тестировать';
    if (complexity <= 10) return 'Средняя сложность: нормальная сложность для большинства функций';
    if (complexity <= 15) return 'Высокая сложность: рекомендуется рефакторинг для упрощения';
    return 'Критическая сложность: необходимо срочное упрощение кода';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Анализатор энтропии кода</h1>

      <div className="mb-6">
        <label htmlFor="code-input" className="block text-sm font-medium text-gray-700 mb-2">
          Введите JavaScript/TypeScript код для анализа:
        </label>
        <textarea
          id="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Введите код здесь..."
        />

        <div className="mt-2 flex justify-end space-x-2">
          <button
            onClick={() => setCode(SAMPLE_CODE)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
            Пример кода
          </button>
          <button
            onClick={() => setCode('')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
            Очистить
          </button>
        </div>
      </div>

      {isAnalyzing && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
          <span>Выполняется анализ энтропии...</span>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Результаты анализа</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Энтропия Шеннона</h3>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${getEntropyColor(result.shannonEntropy)}`}>
                  {result.shannonEntropy.toFixed(4)}
                </span>
                <span className="ml-2 text-gray-600">бит/символ</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Уровень:{' '}
                <span className={getEntropyColor(result.shannonEntropy)}>
                  {getEntropyLevel(result.shannonEntropy)}
                </span>
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Разнообразие символов</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-purple-600">
                  {(result.characterVariety * 100).toFixed(1)}%
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {result.characterVariety.toFixed(3)} уникальных символов на символ кода
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Дублирование строк</h3>
              <div className="flex items-baseline">
                <span
                  className={`text-2xl font-bold ${
                    result.duplicateLinesPercentage > 30 ? 'text-red-600' : 'text-green-600'
                  }`}>
                  {result.duplicateLinesPercentage.toFixed(1)}%
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {result.duplicateLinesPercentage > 0
                  ? `Найдено ${Math.round(
                      (result.duplicateLinesPercentage * linesCount(code)) / 100,
                    )} дубликатов строк`
                  : 'Дубликатов строк не найдено'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Средняя длина строки</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-blue-600">
                  {result.averageLineLength.toFixed(1)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{linesCount(code)} строк кода</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Энтропия имен переменных</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-blue-600">
                  {result.identifierEntropy.toFixed(3)}
                </span>
                <span className="ml-2 text-gray-600">бит/переменная</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Уровень:{' '}
                <span className={getEntropyColor(result.identifierEntropy)}>
                  {getEntropyLevel(result.identifierEntropy)}
                </span>
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Энтропия на уровне токенов</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-blue-600">
                  {result.tokenEntropy.toFixed(3)}
                </span>
                <span className="ml-2 text-gray-600">бит/токен</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Уровень:{' '}
                <span className={getEntropyColor(result.tokenEntropy)}>
                  {getEntropyLevel(result.tokenEntropy)}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Глубина AST</h3>
              <div className="flex items-baseline">
                <span
                  className={`text-2xl font-bold ${
                    result.astDepth > 10
                      ? 'text-red-600'
                      : result.astDepth > 5
                        ? 'text-yellow-600'
                        : 'text-green-600'
                  }`}>
                  {result.astDepth}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {getAstDepthInterpretation(result.astDepth)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Коэффициент ветвления</h3>
              <div className="flex items-baseline">
                <span
                  className={`text-2xl font-bold ${
                    result.astBranchingFactor > 2.5
                      ? 'text-red-600'
                      : result.astBranchingFactor > 1.5
                        ? 'text-yellow-600'
                        : 'text-green-600'
                  }`}>
                  {result.astBranchingFactor.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {getBranchingFactorInterpretation(result.astBranchingFactor)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Разнообразие конструкций</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-purple-600">{result.astDiversity}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {result.astDiversity < 15
                  ? 'Низкое разнообразие: ограниченный набор конструкций, возможно избыточность'
                  : result.astDiversity < 30
                    ? 'Среднее разнообразие: здоровый баланс между разнообразием и согласованностью'
                    : 'Высокое разнообразие: много различных конструкций, может указывать на отсутствие стандартов'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Цикломатическая сложность</h3>
              <div className="flex items-baseline">
                <span
                  className={`text-2xl font-bold ${
                    result.cyclomaticComplexity > 15
                      ? 'text-red-600'
                      : result.cyclomaticComplexity > 10
                        ? 'text-yellow-600'
                        : 'text-green-600'
                  }`}>
                  {result.cyclomaticComplexity}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {getCyclomaticComplexityInterpretation(result.cyclomaticComplexity)}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Интерпретация результатов</h3>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">Энтропия Шеннона:</h4>
                <p className="text-gray-700">
                  {result.shannonEntropy < 2.5
                    ? 'Низкая энтропия указывает на высокую предсказуемость кода, что может быть признаком избыточности или дублирования. Возможно, код можно упростить или вынести повторяющиеся части в функции.'
                    : result.shannonEntropy < 4.0
                      ? 'Средняя энтропия характерна для нормального кода. Баланс между структурированностью и разнообразием операторов.'
                      : 'Высокая энтропия может указывать на сложный, запутанный код с низкой читаемостью. Возможно, стоит пересмотреть архитектуру или добавить комментарии.'}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Дублирование строк:</h4>
                <p className="text-gray-700">
                  {result.duplicateLinesPercentage > 30
                    ? 'Высокий процент дублирования строк указывает на необходимость рефакторинга. Рассмотрите возможность создания общих функций или хуков.'
                    : result.duplicateLinesPercentage > 10
                      ? 'Умеренный процент дублирования. Возможно, некоторые части кода можно объединить.'
                      : 'Низкий процент дублирования строк — хороший признак поддерживаемого кода.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Как интерпретировать энтропию кода?</h3>
        <ul className="list-disc pl-5 text-blue-800 space-y-1">
          <li>
            Низкая энтропия ( менее 2.5 бит/символ): Высокая предсказуемость, возможно избыточность
          </li>
          <li>Средняя энтропия (2.5-4.0 бит/символ): Здоровый баланс структуры и разнообразия</li>
          <li>
            Высокая энтропия (более 4.0 бит/символ): Высокая сложность, возможная запутанность кода
          </li>
        </ul>
        <p className="mt-2 text-blue-700">
          Идеальный код имеет умеренную энтропию — достаточно структурированный для понимания, но с
          достаточным разнообразием для выражения сложной логики.
        </p>
      </div>
    </div>
  );
}

// Вспомогательные функции
function linesCount(code: string): number {
  return code.split('\n').filter((line) => line.trim().length > 0).length;
}

// Пример кода для анализа
const SAMPLE_CODE = `// Пример кода с высокой энтропией
function calculateEntropy(input) {
  if (!input || input.length === 0) return 0;
  
  const frequencies = {};
  const length = input.length;
  
  for (let i = 0; i < length; i++) {
    const char = input.charAt(i);
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  let entropy = 0;
  for (const char in frequencies) {
    const probability = frequencies[char] / length;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}

// Функция с низкой энтропией (много повторений)
function repetitiveCode() {
  console.log('Hello');
  console.log('Hello');
  console.log('Hello');
  console.log('Hello');
  console.log('Hello');
}

// Еще один пример с дубликатами
function duplicateExample() {
  const a = 1;
  const b = 2;
  const c = 3;
  
  // Повторяющийся код
  const result1 = a + b;
  const result2 = a + b;
  const result3 = a + b;
  
  return result1;
}`;
