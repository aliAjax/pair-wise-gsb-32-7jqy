<template>
  <section class="prep-checklist">
    <EmptyState v-if="isEmpty" title="暂无准备事项" :description="messages.emptyPrep" />
    <template v-else>
      <div v-if="sections.pending.length" class="prep-group">
        <h3>待指派 <el-tag type="warning" size="small">{{ sections.pending.length }}</el-tag></h3>
        <article v-for="item in sections.pending" :key="item.id" class="prep-item is-pending">
          <div class="prep-main">
            <strong>{{ item.title }}</strong>
            <p class="muted">截止 {{ item.deadline || '未设置' }}<span v-if="item.overdue" class="overdue">（已逾期）</span></p>
            <p class="reason">{{ item.unassignedReason }}</p>
          </div>
          <div v-if="!readonly" class="prep-ops">
            <el-select
              :model-value="''"
              size="small"
              placeholder="指派给"
              style="width: 120px"
              @update:model-value="(name: string) => $emit('assign', item.id, name)"
            >
              <el-option v-for="member in members" :key="member" :label="member" :value="member" />
            </el-select>
            <el-button size="small" @click="$emit('remove', item.id)">删除</el-button>
          </div>
        </article>
      </div>
      <div v-if="sections.todo.length" class="prep-group">
        <h3>待办 <el-tag type="primary" size="small">{{ sections.todo.length }}</el-tag></h3>
        <article v-for="item in sections.todo" :key="item.id" class="prep-item">
          <div class="prep-main">
            <strong>{{ item.title }}</strong>
            <p class="muted">
              <el-tag size="small" effect="plain">{{ item.assignee }}</el-tag>
              截止 {{ item.deadline || '未设置' }}<span v-if="item.overdue" class="overdue">（已逾期）</span>
            </p>
          </div>
          <div v-if="!readonly" class="prep-ops">
            <el-button size="small" type="primary" @click="$emit('complete', item.id)">办结</el-button>
            <el-button size="small" @click="$emit('remove', item.id)">删除</el-button>
          </div>
        </article>
      </div>
      <div v-if="sections.done.length" class="prep-group">
        <h3>已完成 <el-tag type="success" size="small">{{ sections.done.length }}</el-tag></h3>
        <article v-for="item in sections.done" :key="item.id" class="prep-item is-done">
          <div class="prep-main">
            <strong class="done-title">{{ item.title }}</strong>
            <p class="muted"><el-tag size="small" effect="plain">{{ item.assignee }}</el-tag> 已于 {{ formatDateTime(item.done_at) }} 办结</p>
            <p v-if="item.done_note" class="record">处理记录：{{ item.done_note }}</p>
          </div>
          <div v-if="!readonly" class="prep-ops">
            <el-button size="small" @click="$emit('reopen', item.id)">恢复待办</el-button>
            <el-button size="small" @click="$emit('remove', item.id)">删除</el-button>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import EmptyState from './EmptyState.vue';
import type { PrepSections } from '../../hooks/usePrepList';
import { formatDateTime } from '../../utils/formatters';
import { messages } from '../../constants/messages';
const props = defineProps<{ sections: PrepSections; members: string[]; readonly?: boolean }>();
defineEmits<{ complete: [id: string]; reopen: [id: string]; assign: [id: string, assignee: string]; remove: [id: string] }>();
const isEmpty = computed(() => !props.sections.pending.length && !props.sections.todo.length && !props.sections.done.length);
</script>
<style scoped>
.prep-group { margin-bottom: 20px; }
.prep-group h3 { display: flex; align-items: center; gap: 8px; margin: 12px 0; }
.prep-item { display: flex; justify-content: space-between; align-items: center; gap: 12px; background: #fff; border: 1px solid #dbe7cf; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; flex-wrap: wrap; }
.prep-item.is-pending { border-color: #e6c46a; background: #fffaf0; }
.prep-item.is-done { opacity: 0.85; }
.prep-main p { margin: 4px 0 0; }
.prep-ops { display: flex; gap: 8px; align-items: center; }
.reason { color: #b26a00; }
.record { color: #2d7a46; }
.overdue { color: #c0392b; }
.done-title { text-decoration: line-through; }
</style>
