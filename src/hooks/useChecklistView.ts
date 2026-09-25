import { computed } from 'vue';
import dayjs from 'dayjs';
import { useChecklistStore } from '../stores/checklistStore';
import { buildChecklistView, type ChecklistView } from '../utils/checklist';
import type { Trip } from '../models/trip';

/**
 * 清单页和分享页共用：基于同一份 store 数据（localStorage 持久化）
 * 经同一套排序/分区规则整理出的只读视图。
 */
export function useChecklistView(tripGetter: () => Trip | undefined) {
  const store = useChecklistStore();
  const view = computed<ChecklistView>(() => {
    const trip = tripGetter();
    const items = trip ? store.byTrip(trip.id) : [];
    return buildChecklistView(items, trip?.members || [], dayjs());
  });
  return { checklistStore: store, view };
}
