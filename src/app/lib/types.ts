/**
 * CodeEntropyMetrics – результат полного анализа кода.
 * Все поля – числа, что гарантирует возможность вычислений (сложение, toFixed и т.д.)
 */
export interface CodeEntropyMetrics {
  /** Энтропия Шеннона (бит/символ) – мера неопределённости/информативности текста.
   *   Вычисляется по формуле: -Σ p_i * log2(p_i), где p_i – частота i-го символа.
   *   Низкие значения (<2.5) говорят о предсказуемости/избыточности,
   *   высокие (>4.0) – о хаотичности/сложности.
   */
  shannonEntropy: number;

  /** Энтропия на уровне токенов (лексем). Учитывает повторение ключевых слов,
   *   операторов, чисел и т.д. Позволяет оценить разнообразие лексики кода.
   */
  tokenEntropy: number;

  /** Энтропия имён переменных/идентификаторов. Измеряет, насколько разнообразны
   *   и непредсказуемы названия переменных. Слишком высокая энтропия может указывать
   *   на несогласованность именования.
   */
  identifierEntropy: number;

  /** Разнообразие символов (отношение количества уникальных символов к общей длине).
   *   Значение от 0 до 1. Чем ближе к 1, тем больше различных символов используется.
   */
  characterVariety: number;

  /** Процент дублирующихся строк (строк, которые встречаются более одного раза).
   *   Высокий процент (>30%) – сигнал к рефакторингу (DRY violation).
   */
  duplicateLinesPercentage: number;

  /** Средняя длина строки (в символах) после удаления комментариев.
   *   Полезно для оценки удобочитаемости.
   */
  averageLineLength: number;

  /** Максимальная глубина AST (корень имеет глубину 1). Глубина >10 часто означает
   *   слишком вложенный, трудно читаемый код.
   */
  astDepth: number;

  /** Коэффициент ветвления = (общее количество дочерних узлов) / (количество узлов).
   *   Характеризует, насколько сильно в среднем узел разветвляется.
   *   Значение >2.5 может указывать на сложные структуры.
   */
  astBranchingFactor: number;

  /** Количество различных типов узлов AST (IfStatement, WhileStatement и т.д.).
   *   Отражает разнообразие синтаксических конструкций в коде.
   */
  astDiversity: number;

  /** Цикломатическая сложность Маккейба (количество линейно независимых путей).
   *   Значение >15 считается критическим, требует упрощения.
   */
  cyclomaticComplexity: number;
}
/**
 * Литерал – конкретное значение, записанное в коде.
 * Поле `type` – строковый литерал "Literal". Это – дискриминант (тег),
 * по которому TypeScript отличает этот тип от других.
 *
 * @example
 * const numNode: Literal = { type: "Literal", value: 42 };
 * const strNode: Literal = { type: "Literal", value: "hello" };
 */
export type Literal = {
  type: 'Literal';
  value: string | number | boolean | null;
};

/**
 * Идентификатор – имя переменной, функции, параметра.
 *
 * @example
 * const idNode: Identifier = { type: "Identifier", name: "counter" };
 */
export type Identifier = {
  type: 'Identifier';
  name: string;
};

/**
 * Бинарное выражение – операция с двумя операндами (a + b, x > y и т.д.).
 * Поля `left` и `right` – сами выражения (могут быть Literal, Identifier и т.д.).
 */
export type BinaryExpression = {
  type: 'BinaryExpression';
  operator: string; // например "+", "-", "*", "/", "===", ">" и т.д.
  left: Expression;
  right: Expression;
};

/**
 * Expression – объединение всех возможных выражений.
 * Это и есть размеченное объединение: тип `type` определяет,
 * какие поля доступны.
 */
export type Expression = Literal | Identifier | BinaryExpression;
/**
 * Блок – последовательность инструкций, заключённая в { }.
 *
 * @example
 * const block: BlockStatement = {
 *   type: "BlockStatement",
 *   body: [ /* инструкции * / ]
 * };
 */
export type BlockStatement = {
  type: 'BlockStatement';
  body: Statement[];
};

/**
 * Условная инструкция if (... ) ... else ...
 * Поле `test` – выражение условия, `consequent` – основная ветка,
 * `alternate` – ветка else (может отсутствовать, тогда null).
 */
export type IfStatement = {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
};

/**
 * Цикл while – повторяет тело, пока условие истинно.
 */
export type WhileStatement = {
  type: 'WhileStatement';
  test: Expression;
  body: Statement;
};

/**
 * Объявление переменной – var, let, const.
 * Массив `declarations` может содержать несколько переменных в одном объявлении:
 * let a = 1, b = 2;
 */
export type VariableDeclaration = {
  type: 'VariableDeclaration';
  kind: 'var' | 'let' | 'const';
  declarations: { id: Identifier; init?: Expression }[];
};

/**
 * Выражение как инструкция – например, вызов функции или присваивание,
 * стоящее отдельно (x = 5;).
 */
export type ExpressionStatement = {
  type: 'ExpressionStatement';
  expression: Expression;
};

export type ConditionalExpression = {
  type: 'ConditionalExpression';
  test: Expression; // условие
  consequent: Expression; // выражение, если true
  alternate: Expression; // выражение, если false
};

export type DoWhileStatement = {
  type: 'DoWhileStatement';
  body: Statement; // тело цикла (обычно BlockStatement)
  test: Expression; // условие продолжения
};

export type SwitchCase = {
  type: 'SwitchCase';
  test: Expression | null; // значение case (null для default)
  consequent: Statement[]; // инструкции внутри этого case
};

export type SwitchStatement = {
  type: 'SwitchStatement';
  discriminant: Expression; // выражение, значение которого сравнивается (switch (x))
  cases: SwitchCase[]; // массив вариантов (case/default)
};

export type CatchClause = {
  type: 'CatchClause';
  param: Identifier | null; // переменная ошибки (может отсутствовать)
  body: BlockStatement; // тело catch
};

export type TryStatement = {
  type: 'TryStatement';
  block: BlockStatement; // try-блок (обязателен)
  handler: CatchClause | null; // catch-блок (может отсутствовать)
  finalizer: BlockStatement | null; // finally-блок (может отсутствовать)
};

export type ThrowStatement = {
  type: 'ThrowStatement';
  argument: Expression;
};

export type IdentifierPattern = {
  type: 'Identifier';
  name: string;
};

/**
 * Объектная деструктуризация.
 *
 * @example
 * const { a, b: c } = obj;
 * function f({ x, y }) { }
 */
export type ObjectPattern = {
  type: 'ObjectPattern';
  properties: AssignmentProperty[];
};

/**
 * Массивная деструктуризация.
 *
 * @example
 * const [first, second] = arr;
 * function f([a, b]) { }
 */
export type ArrayPattern = {
  type: 'ArrayPattern';
  elements: (Pattern | null)[];
};

/**
 * Rest-паттерн (сбор оставшихся элементов).
 *
 * @example
 * const [head, ...tail] = arr;
 * function f(x, ...rest) { }
 */
export type RestElement = {
  type: 'RestElement';
  argument: Pattern;
};

/**
 * Свойство внутри ObjectPattern.
 *
 * @example
 * const { a: b } = obj;  // key = 'a', value = IdentifierPattern('b')
 */
export type AssignmentProperty = {
  type: 'Property';
  key: Expression;
  value: Pattern;
  kind: 'init';
  method: false;
  shorthand: boolean;
  computed: boolean;
};

/**
 * Pattern – объединение всех возможных паттернов.
 *
 * Для учебных целей можно начать с простейшего варианта:
 * export type Pattern = IdentifierPattern;
 *
 * И постепенно расширять, добавляя ObjectPattern, ArrayPattern и т.д.
 */
export type Pattern = IdentifierPattern;

export type FunctionDeclaration = {
  type: 'FunctionDeclaration';
  id: Identifier;
  params: Pattern[]; // теперь Pattern определён
  body: BlockStatement;
  async: boolean;
  generator: boolean;
  expression: false;
};

export type FunctionExpression = {
  type: 'FunctionExpression';
  id: Identifier | null;
  params: Pattern[]; // Pattern определён
  body: BlockStatement;
  async: boolean;
  generator: boolean;
  expression: false;
};

export type ArrowFunctionExpression = {
  type: 'ArrowFunctionExpression';
  id: null;
  params: Pattern[]; // Pattern определён
  body: BlockStatement | Expression;
  async: boolean;
  generator: false;
  expression: boolean;
};
/**
 * Statement – объединение всех инструкций. При добавлении нового типа
 * (например, ForStatement) нужно расширить это объединение.
 * Конструктивность: компилятор потребует обработать все варианты в switch.
 */
export type Statement =
  | BlockStatement
  | IfStatement
  | WhileStatement
  | SwitchStatement
  | ThrowStatement
  | DoWhileStatement
  | FunctionDeclaration
  | ArrowFunctionExpression
  | FunctionExpression
  | TryStatement
  | VariableDeclaration
  | Pattern
  | ExpressionStatement;

/**
 * Корневой узел программы. Содержит массив top-level инструкций.
 */
export type Program = {
  type: 'Program';
  body: Statement[];
};

/**
 * AST – итоговый тип для всего дерева. Может быть Program, Statement или Expression.
 * Это позволяет удобно обходить дерево рекурсивно.
 */
export type AST = Program | Statement | Expression;
