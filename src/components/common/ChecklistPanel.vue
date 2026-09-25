<template>
  <section class="checklist">
    <header class="checklist-head">
      <h2>出发准备清单</h2>
      <div class="summary">
        <el-tag type="success">已完成 {{ view.stats.done }}</el-tag>
        <el-tag type="warning">待办理 {{ view.stats.pending }}</el-tag>
        <el-tag v-if="view.stats.overdue" type="danger">已逾期 {{ view.stats.overdue }}</el-tag>
        <el-progress :percentage="view.stats.progress" :stroke-width="10" style="width: 140px" />
      </div>
    </header>

    <form v-if="!readonly" class="add-row" @submit.prevent="submit">
      <el-input v-model="draft.title" placeholder="事项，如：确认酒店预约" clearable style="width: 260px" />
      <el-select
        v-model="draft.assignee"
        filterable
        allow-create
        default-first-option
        placeholder="负责人（同行人）"
        style="width: 180px"
      >
        <el-option v-for="member in trip.members" :key="member" :label="member" :value="member" />
      </el-select>
      <el-date-picker
        v-model="draft.deadline"
        type="datetime"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DDTHH:mm"
        placeholder="截止时间（可不填）"
        style="width: 220px"
      />
      <el-button type="primary" native-type="submit">添加事项</el-button>
    </form>

    <EmptyState v-if="!view.assigned.length && !view.unassigned.length" title="还没有准备事项" description="把预约确认、随身物品逐项记下来，分工和截止时间一目了然。" />

    <div v-if="view.assigned.length" class="zone">
      <h3>准备事项</h3>
      <ChecklistItemRow
        v-for="item in view.assigned"
        :key="item.id"
        :item="item"
        :members="trip.members"
        :readonly="readonly"
        @toggle="toggleDone"
        @update-field="onUpdateField"
        @remove="checklistStore.removeItem"
      />
    </div>

    <div v-if="view.unassigned.length" class="zone unassigned-zone">
      <h3>待指派区 <span class="muted">（负责人不在同行人名单内，需改派给同行人）</span></h3>
      <ChecklistItemRow
        v-for="item in view.unassigned"
        :key="item.id"
        :item="item"
        :members="trip.members"
        :readonly="readonly"
        unassigned
        @toggle="toggleDone"
        @update-field="onUpdateField"
        @remove="checklistStore.removeItem"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { ElMessageBox } from 'element-plus';
import type { Trip } from '../../models/trip';
import type { ChecklistDraft, ChecklistItem } from '../../models/checklist';
import { useChecklistView } from '../../hooks/useChecklistView';
import { messages } from '../../constants/messages';
import { toast } from '../../utils/message';
import EmptyState from './EmptyState.vue';
import ChecklistItemRow from './ChecklistItemRow.vue';

const props = withDefaults(defineProps<{ trip: Trip; readonly?: boolean }>(), { readonly: false });
const { checklistStore, view } = useChecklistView(() => props.trip);

const draft = reactive<ChecklistDraft>({ title: '', assignee: '', deadline: '' });

function submit() {
  if (!draft.title.trim()) {
    toast.warn(messages.checklistNeedTitle);
    return;
  }
  checklistStore.addItem(props.trip.id, { ...draft });
  draft.title = '';
  draft.assignee = '';
  draft.deadline = '';
}

async function toggleDone(item: ChecklistItem) {
  if (props.readonly) return;
  if (item.done) {
    checklistStore.reopenItem(item.id);
    return;
  }
  try {
    const { value } = await ElMessageBox.prompt('办结说明（可留空，将作为处理记录保存）', '完成事项', {
      confirmButtonText: '确认办结',
      cancelButtonText: '取消',
      inputValue: '',
    });
    checklistStore.completeItem(item.id, value || '');
  } catch {
    /* 取消办结 */
  }
}

function onUpdateField(payload: { id: string; patch: Partial<Pick<ChecklistItem, 'title' | 'assignee' | 'deadline'>> }) {
  checklistStore.updateItem(payload.id, payload.patch);
}
</script>

<style scoped>
.checklist { margin-top: 20px; }
.checklist-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.summary { display: flex; align-items: center; gap: 8px; }
.add-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 14px 0; }
.zone { margin-top: 18px; }
.zone h3 { margin: 0 0 8px; font-size: 15px; }
.unassigned-zone { background: #fff7ed; border: 1px dashed #d99a4e; border-radius: 8px; padding: 12px 14px; }
</style>
