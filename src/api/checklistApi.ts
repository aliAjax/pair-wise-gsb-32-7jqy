import type { ChecklistItem } from '../models/checklist';
import { STORAGE_KEYS } from '../constants/storageVersion';
import { loadLocal, saveLocal } from '../utils/storage';

export const checklistApi = {
  list: () => loadLocal<ChecklistItem[]>(STORAGE_KEYS.checklist, []),
  save: (items: ChecklistItem[]) => saveLocal(STORAGE_KEYS.checklist, items),
};
