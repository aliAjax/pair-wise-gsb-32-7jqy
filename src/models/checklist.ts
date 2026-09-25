export interface CompletionLog {
  /** 办理时间 ISO 字符串 */
  at: string;
  /** 办理人，默认取事项负责人 */
  by: string;
  /** 办理记录备注，可留空 */
  note: string;
}

export interface ChecklistItem {
  id: string;
  trip_id: string;
  /** 事项 */
  title: string;
  /** 负责人，需为 trip.members 中的同行人，否则进入待指派区 */
  assignee: string;
  /** 截止时间，空串表示未设定；否则为 'YYYY-MM-DDTHH:mm' */
  deadline: string;
  done: boolean;
  completed_at?: string;
  /** 办完时留下的处理记录 */
  logs: CompletionLog[];
  created_at: string;
}

export interface ChecklistDraft {
  title: string;
  assignee: string;
  deadline: string;
}
