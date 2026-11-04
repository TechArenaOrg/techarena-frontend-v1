'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { CategoryFormDialog } from '@/components/admin/CategoryFormDialog';
import { DeleteCategoryButton } from '@/components/admin/DeleteCategoryButton';
import type { Category } from '@/types';

interface TreeNode extends Category {
  childNodes: TreeNode[];
}

function buildTree(categories: Category[]): TreeNode[] {
  const byParent = new Map<string, Category[]>();
  categories.forEach((c) => {
    const key = c.parentId ?? '';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  });
  const sortSiblings = (list: Category[]) => [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  function build(parentKey: string): TreeNode[] {
    const children = sortSiblings(byParent.get(parentKey) ?? []);
    return children.map((c) => ({ ...c, childNodes: build(c.id) }));
  }

  return build('');
}

function countDescendants(node: TreeNode): number {
  return node.childNodes.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

function Row({ node, depth, allCategories }: { node: TreeNode; depth: number; allCategories: Category[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.childNodes.length > 0;
  const productCount = node.products?.length ?? 0;

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-3 py-3 px-4 border-b hover:bg-muted/50 transition-colors"
        style={{ paddingLeft: 16 + depth * 28 }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          disabled={!hasChildren}
          className="shrink-0 h-5 w-5 flex items-center justify-center text-muted-foreground disabled:opacity-0"
        >
          <Icons.chevronRight className={`h-4 w-4 transition-transform ${!collapsed ? 'rotate-90' : ''}`} />
        </button>

        <div className="shrink-0 h-9 w-9 rounded-lg overflow-hidden bg-muted flex items-center justify-center text-lg">
          {node.imageUrl ? (
            <Image src={node.imageUrl} alt="" width={36} height={36} className="object-cover h-full w-full" />
          ) : node.icon ? (
            <span>{node.icon}</span>
          ) : (
            <Icons.folderTree className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{node.name}</span>
            <Badge variant={node.status === 'active' ? 'success' : 'secondary'} className="capitalize shrink-0">
              {node.status}
            </Badge>
            {node.isFeatured && (
              <Badge className="bg-orange-500 text-white border-0 shrink-0">
                <Icons.star className="mr-1 h-3 w-3 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">
            /{node.slug} • {productCount} product{productCount !== 1 ? 's' : ''}
            {hasChildren && ` • ${node.childNodes.length} subcategor${node.childNodes.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <CategoryFormDialog
            allCategories={allCategories}
            defaultParentId={node.id}
            trigger={
              <Button variant="ghost" size="sm" title="Add subcategory">
                <Icons.plus className="h-4 w-4" />
              </Button>
            }
          />
          <CategoryFormDialog
            allCategories={allCategories}
            category={node}
            trigger={
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            }
          />
          <DeleteCategoryButton
            categoryId={node.id}
            categoryName={node.name}
            childCount={countDescendants(node)}
            productCount={productCount}
          />
        </div>
      </div>

      {!collapsed && hasChildren && (
        <div>
          {node.childNodes.map((child) => (
            <Row key={child.id} node={child} depth={depth + 1} allCategories={allCategories} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({ categories }: { categories: Category[] }) {
  const tree = useMemo(() => buildTree(categories), [categories]);

  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <Icons.folderTree className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No categories yet.</p>
        <p className="text-sm text-muted-foreground">Create the first one to let vendors assign products to it.</p>
      </div>
    );
  }

  return (
    <div>
      {tree.map((node) => (
        <Row key={node.id} node={node} depth={0} allCategories={categories} />
      ))}
    </div>
  );
}
