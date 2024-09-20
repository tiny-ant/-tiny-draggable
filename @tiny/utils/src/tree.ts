type TreeType<T extends object> = T & {
  children?: T[]
}

/** 递归遍历树节点 */
export function traverseTree<T extends object>(
  tree: TreeType<T>[] = [],
  cb: (data: TreeType<T>) => void
) {
  function traverse(treeNodes: TreeType<T>[]) {
    treeNodes.forEach((treeNode) => {
      cb(treeNode)

      if (Array.isArray(treeNode.children)) {
        traverse(treeNode.children)
      }
    })
  }

  traverse(tree)
}
