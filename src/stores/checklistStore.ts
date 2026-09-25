import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import type { ChecklistDraft, ChecklistItem } from '../models/checklist';
import { checklistApi } from '../api/checklistApi';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

export const useChecklistStore = defineStore('checklist', {
  state: () => ({ items: checklistApi.list() as ChecklistItem[] }),
  getters: {
    byTrip: (state) => (tripId: string) => state.items.filter((item) => item.trip_id === tripId),
  },
  actions: {
    persist() {
      checklistApi.save(this.items);
    },
    addItem(tripId: string, draft: ChecklistDraft) {
      const item: ChecklistItem = {
        id: crypto.randomUUID(),
        trip_id: tripId,
        title: draft.title.trim(),
        assignee: draft.assignee.trim(),
        deadline: draft.deadline || '',
        done: false,
        logs: [],
        created_at: new Date().toISOString(),
      };
      this.items.push(item);
      this.persist();
      toast.ok(messages.checklistAdded);
    },
    updateItem(id: string, patch: Partial<Pick<ChecklistItem, 'title' | 'assignee' | 'deadline'>>) {
      const item = this.items.find((target) => target.id === id);
      if (!item) return;
      if (patch.title !== undefined) item.title = patch.title.trim();
      if (patch.assignee !== undefined) item.assignee = patch.assignee.trim();
      if (patch.deadline !== undefined) item.deadline = patch.deadline || '';
      this.persist();
    },
    completeItem(id: string, note: string, by?: string) {
      const item = this.items.find((target) => target.id === id);
      if (!item || item.done) return;
      const at = new Date().toISOString();
      item.done = true;
      item.completed_at = at;
      item.logs.push({ at, by: (by || item.assignee || '经办人').trim(), note: note.trim() });
      this.persist();
      toast.ok(messages.checklistCompleted);
    },
    reopenItem(id: string) {
      const item = this.items.find((target) => target.id === id);
      if (!item || !item.done) return;
      item.done = false;
      item.completed_at = undefined;
      this.persist();
      toast.ok(messages.checklistReopened);
    },
    removeItem(id: string) {
      this.items = this.items.filter((item) => item.id !== id);
      this.persist();
      toast.ok(messages.checklistRemoved);
    },
    seedSampleItems(tripId: string, members: string[]) {
      if (this.items.some((item) => item.trip_id === tripId)) return;
      const partner = members[0] || '我';
      const friend = members[1] || '朋友';
      const base = Date.now();
      const future = (hours: number) => dayjs(base + hours * 3600 * 1000).format('YYYY-MM-DDTHH:mm');
      const past = (hours: number) => dayjs(base - hours * 3600 * 1000).format('YYYY-MM-DDTHH:mm');
      const make = (draft: ChecklistDraft): ChecklistItem => ({
        id: crypto.randomUUID(),
        trip_id: tripId,
        title: draft.title,
        assignee: draft.assignee,
        deadline: draft.deadline,
        done: false,
        logs: [],
        created_at: new Date().toISOString(),
      });
      this.items.push(
        make({ title: '确认酒店预约并截图入住凭证', assignee: partner, deadline: future(20) }),
        make({ title: '核对往返车票/机票', assignee: friend, deadline: past(2) }),
        make({ title: '购买旅行意外险', assignee: '', deadline: future(48) }),
        make({ title: '打印签证材料（代办：签证顾问）', assignee: '签证顾问', deadline: future(30) }),
        make({ title: '准备转换插头与充电宝', assignee: friend, deadline: '' }),
      );
      this.persist();
      toast.ok(messages.checklistSeeded);
    },
  },
});
