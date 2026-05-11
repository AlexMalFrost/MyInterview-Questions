import { AST } from '../../types';

type DepthMetrics = {
  maxDepth: number; // максимальная глубина (корень = 1)
  nodeCount: number; // количество узлов
  totalChildren: number; // общее количество прямых связей родитель-ребёнок
};

export function analyzeTreeStructure(node: AST): DepthMetrics {
  // Рекурсивная функция, возвращающая метрики для поддерева,
  // начиная с текущей глубины depth.
  function traverse(node: AST, depth: number): DepthMetrics {
    // Инициализируем метрики текущего узла
    let nodeCount = 1; // сам узел
    let maxDepth = depth; // глубина текущего узла
    let totalChildren = 0; // дети текущего узла (прямые)

    // Определяем дочерние узлы в зависимости от типа
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
        // declarations: массив объектов, но init может быть Expression
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
        // листья, детей нет
        children = [];
        break;

      default:
        // exhaustiveness check: если добавите новый тип, компилятор напомнит
        const _exhaustive: never = node;
        return _exhaustive;
    }

    // Подсчёт прямых детей (totalChildren) и рекурсивный обход
    totalChildren += children.length;
    for (const child of children) {
      const childMetrics = traverse(child, depth + 1);
      nodeCount += childMetrics.nodeCount;
      maxDepth = Math.max(maxDepth, childMetrics.maxDepth);
      totalChildren += childMetrics.totalChildren;
    }

    return { maxDepth, nodeCount, totalChildren };
  }

  // Начинаем с глубины 1 для корня
  return traverse(node, 1);
}
