import type { Trip } from '../models/trip';
import type { PrepItem } from '../models/prepItem';
import { prepUnassignedReason } from '../constants/prep';
import { sortPrepItems } from '../utils/prepSorter';

export interface PrepListItem extends PrepItem {
  unassigned: boolean;
  unassignedReason: string;
  overdue: boolean;
}

export interface PrepSections {
  pending: PrepListItem[];
  todo: PrepListItem[];
  done: PrepListItem[];
}

export const emptyPrepSections = (): PrepSections => ({ pending: [], todo: [], done: [] });

export function usePrepList(trip: Trip, items: PrepItem[]): PrepSections {
  const today = new Date().toISOString().slice(0, 10);
  const enriched: PrepListItem[] = items
    .filter((item) => item.trip_id === trip.id)
    .map((item) => {
      const unassigned = !item.assignee || !trip.members.includes(item.assignee);
      return {
        ...item,
        unassigned,
        unassignedReason: unassigned ? prepUnassignedReason(item.assignee) : '',
        overdue: !item.done && !!item.deadline && item.deadline < today,
      };
    });
  return {
    pending: sortPrepItems(enriched.filter((item) => item.unassigned && !item.done)),
    todo: sortPrepItems(enriched.filter((item) => !item.unassigned && !item.done)),
    done: sortPrepItems(enriched.filter((item) => item.done)),
  };
}
