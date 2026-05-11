export function calculateCyclomaticComplexity(ast: any): number {
  let complexity = 1;

  function countLogicalOperators(node: any) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'LogicalExpression') {
      complexity++;
      countLogicalOperators(node.left);
      countLogicalOperators(node.right);
    }
  }

  function traverse(node: any) {
    if (!node || typeof node !== 'object') return;
    const isConditional = [
      'IfStatement',
      'WhileStatement',
      'DoWhileStatement',
      'ForStatement',
      'ForInStatement',
      'ForOfStatement',
    ].includes(node.type);
    if (isConditional) {
      complexity++;
      if (node.test) countLogicalOperators(node.test);
    }
    if (node.type === 'ConditionalExpression') {
      complexity++;
      if (node.test) countLogicalOperators(node.test);
    }
    if (node.type === 'SwitchStatement' && node.cases) {
      complexity += node.cases.filter((c: any) => c.test).length;
    }
    if (node.type === 'TryStatement') {
      if (node.handler) complexity++;
      if (node.finalizer) complexity++;
    }
    for (const key in node) {
      if (['type', 'start', 'end'].includes(key)) continue;
      const child = node[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) child.forEach(traverse);
        else traverse(child);
      }
    }
  }

  traverse(ast);
  return complexity;
}
