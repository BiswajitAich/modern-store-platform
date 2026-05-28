export interface CategoryTreeNode {
  id: number;
  name: string;
  parentId: number | null;
  children: CategoryTreeNode[];
}

export function buildTree(flat: CategoryTreeNode[]) {
  const map = new Map<number, CategoryTreeNode>();

  for (const item of flat) {
    map.set(item.id, { ...item, children: [] });
  }

  const roots: CategoryTreeNode[] = [];

  for (const node of map.values()) {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}