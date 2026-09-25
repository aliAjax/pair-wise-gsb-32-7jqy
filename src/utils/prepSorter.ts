import type { PrepItem } from '../models/prepItem';

type SortablePrep = Pick<PrepItem, 'done' | 'deadline' | 'created_at'>;

export function sortPrepItems<T extends SortablePrep>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (!a.deadline && b.deadline) return 1;
    if (a.deadline && !b.deadline) return -1;
    if (a.deadline !== b.deadline) return a.deadline < b.deadline ? -1 : 1;
    return a.created_at < b.created_at ? -1 : 1;
  });
}
