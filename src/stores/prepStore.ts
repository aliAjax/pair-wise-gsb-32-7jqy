import { defineStore } from 'pinia';
import type { PrepItem } from '../models/prepItem';
import { prepApi } from '../api/prepApi';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

export const usePrepStore = defineStore('prep', {
  state: () => ({ items: prepApi.list() as PrepItem[] }),
  getters: {
    byTrip: (state) => (tripId: string) => state.items.filter((item) => item.trip_id === tripId),
  },
  actions: {
    addItem(tripId: string, title: string, assignee: string, deadline: string) {
      const item: PrepItem = {
        id: crypto.randomUUID(),
        trip_id: tripId,
        title,
        assignee,
        deadline,
        done: false,
        done_at: '',
        done_note: '',
        created_at: new Date().toISOString(),
      };
      this.items.push(item);
      prepApi.save(this.items);
      toast.ok(messages.prepAdded);
    },
    completeItem(id: string, note: string) {
      const item = this.items.find((entry) => entry.id === id);
      if (!item) return;
      item.done = true;
      item.done_at = new Date().toISOString();
      item.done_note = note;
      prepApi.save(this.items);
      toast.ok(messages.prepCompleted);
    },
    reopenItem(id: string) {
      const item = this.items.find((entry) => entry.id === id);
      if (!item) return;
      item.done = false;
      item.done_at = '';
      item.done_note = '';
      prepApi.save(this.items);
      toast.ok(messages.prepReopened);
    },
    assignItem(id: string, assignee: string) {
      const item = this.items.find((entry) => entry.id === id);
      if (!item) return;
      item.assignee = assignee;
      prepApi.save(this.items);
      toast.ok(messages.prepAssigned);
    },
    removeItem(id: string) {
      this.items = this.items.filter((entry) => entry.id !== id);
      prepApi.save(this.items);
      toast.ok(messages.prepRemoved);
    },
  },
});
