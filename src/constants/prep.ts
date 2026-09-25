export const PREP_DEFAULT_ASSIGNEE = '';

export const prepUnassignedReason = (assignee: string) =>
  assignee ? `「${assignee}」不在同行人名单中，需重新指派` : '尚未填写负责人，待指派';
