export type SortDirection = 'asc' | 'desc';

export type SortableField =
  | 'category'
  | 'title'
  | 'createdAt'
  | 'random'
  | 'price'
  | 'sales'
  | 'likes';

export interface SortField {
  field: SortableField;
  direction: SortDirection;
}
