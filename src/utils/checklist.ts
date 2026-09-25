import dayjs from 'dayjs';
import type { ChecklistItem } from '../models/checklist';

/** 截止时间升序；未设定截止时间的排在设定之后；再按创建时间兜底 */
function compareDeadline(a: ChecklistItem, b: ChecklistItem): number {
  if (!a.deadline && !b.deadline) return a.created_at.localeCompare(b.created_at);
  if (!a.deadline) return 1;
  if (!b.deadline) return -1;
  const diff = dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf();
  return diff !== 0 ? diff : a.created_at.localeCompare(b.created_at);
}

/** 未完成排在最上面：组内未完成按截止时间升序，已完成按完成时间倒序 */
export function sortItems<T extends ChecklistItem>(items: T[], now = dayjs()): T[] {
  return [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done && b.done) {
      return (b.completed_at || '').localeCompare(a.completed_at || '');
    }
    const urgent = Number(isOverdue(b, now)) - Number(isOverdue(a, now));
    return urgent !== 0 ? urgent : compareDeadline(a, b);
  });
}

/** 负责人是否属于同行人名单（空负责人也不算同行人） */
export function isMemberAssignee(assignee: string, members: string[]): boolean {
  const name = assignee.trim();
  return name !== '' && members.some((member) => member.trim() === name);
}

/** 待指派原因：负责人为空，或不在同行人名单里 */
export function unassignedReason(assignee: string): string {
  return assignee.trim() === '' ? '尚未填写负责人' : `负责人「${assignee.trim()}」不在同行人名单中`;
}

export function isOverdue(item: ChecklistItem, now = dayjs()): boolean {
  return !item.done && !!item.deadline && dayjs(item.deadline).isBefore(now);
}

export function isDueSoon(item: ChecklistItem, hours = 24, now = dayjs()): boolean {
  if (item.done || !item.deadline) return false;
  const diff = dayjs(item.deadline).valueOf() - now.valueOf();
  return diff >= 0 && diff <= hours * 3600 * 1000;
}

export interface ChecklistStats {
  total: number;
  done: number;
  pending: number;
  overdue: number;
  progress: number;
}

export function buildStats(items: ChecklistItem[], now = dayjs()): ChecklistStats {
  const done = items.filter((item) => item.done).length;
  const overdue = items.filter((item) => isOverdue(item, now)).length;
  const total = items.length;
  return {
    total,
    done,
    pending: total - done,
    overdue,
    progress: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

/**
 * 清单页与分享页共用的同一份整理结果：
 * 负责人在同行人名单内的进入正常清单，其余进入待指派区并写明原因。
 */
export interface ChecklistView {
  assigned: ChecklistItem[];
  unassigned: Array<ChecklistItem & { reason: string }>;
  stats: ChecklistStats;
}

export function buildChecklistView(items: ChecklistItem[], members: string[], now = dayjs()): ChecklistView {
  const assigned: ChecklistItem[] = [];
  const unassigned: Array<ChecklistItem & { reason: string }> = [];
  for (const item of items) {
    if (isMemberAssignee(item.assignee, members)) {
      assigned.push(item);
    } else {
      unassigned.push({ ...item, reason: unassignedReason(item.assignee) });
    }
  }
  return {
    assigned: sortItems(assigned, now),
    unassigned: sortItems(unassigned, now),
    stats: buildStats(items, now),
  };
}

/** 分享文本（复制行程文本时附带同一份清单结果） */
export function buildShareText(tripTitle: string, view: ChecklistView): string {
  const lines: string[] = [`【${tripTitle}】出发准备清单`, `进度 ${view.stats.done}/${view.stats.total}（${view.stats.progress}%）`];
  lines.push('', '一、准备事项');
  if (view.assigned.length === 0) {
    lines.push('（暂无）');
  }
  view.assigned.forEach((item, index) => {
    const state = item.done ? '已完成' : isOverdue(item) ? '已逾期' : '待办理';
    const deadline = item.deadline ? dayjs(item.deadline).format('YYYY-MM-DD HH:mm') : '无截止时间';
    lines.push(`${index + 1}. [${state}] ${item.title}｜负责人：${item.assignee.trim()}｜截止：${deadline}`);
    item.logs.forEach((log) => {
      lines.push(`   处理记录 ${dayjs(log.at).format('YYYY-MM-DD HH:mm')} ${log.by}：${log.note || '已办结'}`);
    });
  });
  lines.push('', '二、待指派区');
  if (view.unassigned.length === 0) {
    lines.push('（暂无）');
  }
  view.unassigned.forEach((item, index) => {
    const state = item.done ? '已完成' : '待办理';
    lines.push(`${index + 1}. [${state}] ${item.title}｜${item.reason}`);
  });
  return lines.join('\n');
}
