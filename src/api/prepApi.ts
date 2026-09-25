import type { PrepItem } from '../models/prepItem';
import { STORAGE_KEYS } from '../constants/storageVersion';
import { loadLocal, saveLocal } from '../utils/storage';

export const prepApi = {
  list: () => loadLocal<PrepItem[]>(STORAGE_KEYS.prepItems, []),
  save: (items: PrepItem[]) => saveLocal(STORAGE_KEYS.prepItems, items),
};
