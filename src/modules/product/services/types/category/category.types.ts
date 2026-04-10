export interface CategoryResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  emoticon: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTreeNode extends CategoryResult {
  children: CategoryTreeNode[];
}

export interface CategoryListResult {
  tree: CategoryTreeNode[];
  flat: CategoryResult[];
}
