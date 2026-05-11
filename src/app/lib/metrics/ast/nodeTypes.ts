import { AST } from '../../types';

export interface NodeTypesResult {
  nodeTypes: Set<string>;
  controlFlowNodes: {
    conditions: number;
    loops: number;
    switches: number;
    exceptions: number;
    functions: number;
  };
}

export function analyzeNodeTypes(ast: AST): NodeTypesResult {
  // Вспомогательная рекурсия: возвращает накопленные метрики для поддерева
  function collect(node: AST): {
    types: Set<string>;
    conditions: number;
    loops: number;
    switches: number;
    exceptions: number;
    functions: number;
  } {
    // Начальные значения для текущего узла
    let types = new Set<string>();
    let conditions = 0;
    let loops = 0;
    let switches = 0;
    let exceptions = 0;
    let functions = 0;

    // Добавляем тип текущего узла
    types.add(node.type);

    // Учитываем сам узел в статистике управляющих конструкций
    switch (node.type) {
      case 'IfStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
        // В вашем AST, возможно, нет ForStatement и т.д. – добавьте по необходимости
        // case 'ForStatement':
        // case 'ForOfStatement':
        // case 'ForInStatement':
        loops++;
        break;
      case 'SwitchStatement':
        switches++;
        break;
      case 'TryStatement':
      case 'ThrowStatement':
        exceptions++;
        break;
      case 'FunctionDeclaration':
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        functions++;
        break;
      // Для узлов, которые не являются управляющими, ничего не делаем
    }

    // Определяем дочерние узлы в зависимости от типа (аналогично analyzeTreeStructure)
    let children: AST[] = [];
    switch (node.type) {
      case 'Program':
        children = node.body;
        break;
      case 'BlockStatement':
        children = node.body;
        break;
      case 'IfStatement':
        children = [node.test, node.consequent];
        if (node.alternate) children.push(node.alternate);
        break;
      case 'WhileStatement':
        children = [node.test, node.body];
        break;
      case 'VariableDeclaration':
        for (const decl of node.declarations) {
          children.push(decl.id);
          if (decl.init) children.push(decl.init);
        }
        break;
      case 'ExpressionStatement':
        children = [node.expression];
        break;
      case 'BinaryExpression':
        children = [node.left, node.right];
        break;
      case 'Literal':
      case 'Identifier':
        children = [];
        break;
      case 'DoWhileStatement':
        children = [node.body, node.test];
        break;
      case 'SwitchStatement':
        // Добавляем discriminant как обычного ребёнка
        children = [node.discriminant];
        // Для каждого case обрабатываем его потомков отдельно
        for (const caseItem of node.cases) {
          if (caseItem.test) {
            children.push(caseItem.test);
          }
          // consequent – это Statement[], их тоже нужно обойти
          children.push(...caseItem.consequent);
        }
        break;
      case 'ThrowStatement':
        children = [node.argument];
        break;

      case 'FunctionDeclaration':
        children = [node.id, ...node.params, node.body];
        break;

      case 'FunctionExpression':
        children = [];
        if (node.id) children.push(node.id);
        children.push(...node.params, node.body);
        break;

      case 'ArrowFunctionExpression':
        children = [...node.params, node.body];
        break;

      case 'TryStatement':
        children = [node.block];
        if (node.handler) {
          children.push(node.handler.body);
          if (node.handler.param) children.push(node.handler.param);
        }
        if (node.finalizer) children.push(node.finalizer);
        break;
      // Добавьте другие типы по мере необходимости
      default:
        // exhaustiveness check
        const _exhaustive: never = node;
        return { types, conditions, loops, switches, exceptions, functions };
    }

    // Рекурсивно собираем статистику от детей и объединяем
    for (const child of children) {
      const childStats = collect(child);
      // Объединение множеств
      for (const t of childStats.types) types.add(t);
      conditions += childStats.conditions;
      loops += childStats.loops;
      switches += childStats.switches;
      exceptions += childStats.exceptions;
      functions += childStats.functions;
    }

    return { types, conditions, loops, switches, exceptions, functions };
  }

  const result = collect(ast);
  return {
    nodeTypes: result.types,
    controlFlowNodes: {
      conditions: result.conditions,
      loops: result.loops,
      switches: result.switches,
      exceptions: result.exceptions,
      functions: result.functions,
    },
  };
}
