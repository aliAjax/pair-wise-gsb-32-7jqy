<template>
  <article class="row" :class="{ done: item.done }">
    <el-checkbox
      :model-value="item.done"
      :disabled="readonly"
      size="large"
      @change="$emit('toggle', item)"
    />
    <div class="body">
      <div class="line">
        <template v-if="!readonly">
          <el-input
            :model-value="item.title"
            size="small"
            style="width: 280px"
            @change="(value: string) => emit('update-field', { id: item.id, patch: { title: value } })"
          />
        </template>
        <strong v-else :class="{ 'done-title': item.done }">{{ item.title }}</strong>

        <el-select
          :model-value="item.assignee"
          :disabled="readonly"
          filterable
          allow-create
          default-first-option
          size="small"
          placeholder="指派给"
          style="width: 150px"
          @change="(value: string) => emit('update-field', { id: item.id, patch: { assignee: value || '' } })"
        >
          <el-option v-for="member in members" :key="member" :label="member" :value="member" />
        </el-select>

        <el-date-picker
          :model-value="item.deadline || undefined"
          :disabled="readonly"
          type="datetime"
          size="small"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DDTHH:mm"
          placeholder="无截止时间"
          style="width: 200px"
          @change="(value: string | null) => emit('update-field', { id: item.id, patch: { deadline: value || '' } })"
        />

        <el-tag v-if="item.done" type="success" size="small">已完成</el-tag>
        <el-tag v-else-if="overdue" type="danger" size="small">已逾期</el-tag>
        <el-tag v-else-if="dueSoon" type="warning" size="small">临近截止</el-tag>

        <el-button v-if="!readonly" link type="danger" size="small" @click="emit('remove', item.id)">删除</el-button>
      </div>

      <p v-if="unassigned" class="reason">⚠️ {{ reason }}；改派给名单内同行人后自动回到准备事项</p>

      <div class="meta">
        <el-popover v-if="item.logs.length" trigger="click" width="320">
          <template #reference>
            <el-button link type="primary" size="small">处理记录（{{ item.logs.length }}）</el-button>
          </template>
          <div class="logs">
            <p v-for="(log, index) in item.logs" :key="index" class="log">
              <strong>{{ formatTime(log.at) }} {{ log.by }}</strong><br />
              <span class="muted">{{ log.note || '已办结' }}</span>
            </p>
          </div>
        </el-popover>
        <span v-if="item.completed_at" class="muted">办结于 {{ formatTime(item.completed_at) }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import type { ChecklistItem } from '../../models/checklist';
import { isDueSoon, isOverdue, unassignedReason } from '../../utils/checklist';

const props = withDefaults(
  defineProps<{
    item: ChecklistItem;
    members: string[];
    readonly?: boolean;
    unassigned?: boolean;
  }>(),
  { readonly: false, unassigned: false },
);

const emit = defineEmits<{
  toggle: [item: ChecklistItem];
  'update-field': [payload: { id: string; patch: Partial<Pick<ChecklistItem, 'title' | 'assignee' | 'deadline'>> }];
  remove: [id: string];
}>();

const overdue = computed(() => isOverdue(props.item));
const dueSoon = computed(() => isDueSoon(props.item));
const reason = computed(() => unassignedReason(props.item.assignee));
const formatTime = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm');
</script>

<style scoped>
.row { display: flex; gap: 12px; align-items: flex-start; padding: 12px; border: 1px solid #dbe7cf; border-radius: 8px; background: #fff; margin-bottom: 8px; }
.row.done { background: #f6faf2; }
.body { flex: 1; min-width: 0; }
.line { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.done-title { color: #61706b; text-decoration: line-through; }
.reason { margin: 6px 0 0; color: #b45309; font-size: 13px; }
.meta { margin-top: 6px; display: flex; gap: 12px; align-items: center; font-size: 12px; }
.log { margin: 0 0 8px; line-height: 1.5; }
.log:last-child { margin-bottom: 0; }
</style>
