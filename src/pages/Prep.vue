<template>
  <main class="page" v-if="trip">
    <TripHeader :trip="trip" />
    <div class="toolbar">
      <el-button @click="router.push('/trip/' + trip.id)">返回行程</el-button>
      <el-button @click="router.push('/share')">分享预览</el-button>
    </div>
    <section class="band">
      <strong>添加准备事项</strong>
      <div class="toolbar">
        <el-input v-model="form.title" placeholder="事项，如：预订民宿" style="width: 220px" />
        <el-select v-model="form.assignee" filterable allow-create placeholder="负责人" style="width: 140px">
          <el-option v-for="member in trip.members" :key="member" :label="member" :value="member" />
        </el-select>
        <el-date-picker v-model="form.deadline" value-format="YYYY-MM-DD" placeholder="截止时间" style="width: 160px" />
        <el-button type="primary" :disabled="!form.title.trim()" @click="add">添加</el-button>
      </div>
      <p class="muted">负责人不在同行人名单中的事项会留在待指派区，指派后才进入待办。</p>
    </section>
    <PrepChecklist
      :sections="sections"
      :members="trip.members"
      @complete="complete"
      @reopen="prepStore.reopenItem"
      @assign="prepStore.assignItem"
      @remove="prepStore.removeItem"
    />
  </main>
  <main v-else class="page"><EmptyState title="旅行不存在" /></main>
</template>
<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useTripStore } from '../stores/tripStore';
import { usePrepStore } from '../stores/prepStore';
import { usePrepList, emptyPrepSections } from '../hooks/usePrepList';
import { PREP_DEFAULT_ASSIGNEE } from '../constants/prep';
import TripHeader from '../components/common/TripHeader.vue';
import PrepChecklist from '../components/common/PrepChecklist.vue';
import EmptyState from '../components/common/EmptyState.vue';
const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const prepStore = usePrepStore();
const trip = computed(() => tripStore.trips.find((item) => item.id === route.params.tripId));
const sections = computed(() => (trip.value ? usePrepList(trip.value, prepStore.items) : emptyPrepSections()));
const form = reactive({ title: '', assignee: PREP_DEFAULT_ASSIGNEE, deadline: '' });
function add() {
  if (!trip.value || !form.title.trim()) return;
  prepStore.addItem(trip.value.id, form.title.trim(), form.assignee, form.deadline);
  form.title = '';
  form.assignee = PREP_DEFAULT_ASSIGNEE;
  form.deadline = '';
}
async function complete(id: string) {
  try {
    const { value } = await ElMessageBox.prompt('留一条处理记录（可留空）', '办结事项', {
      confirmButtonText: '办结',
      cancelButtonText: '取消',
      inputPlaceholder: '如：已出票，订单号 123456',
    });
    prepStore.completeItem(id, (value || '').trim());
  } catch {
    /* 取消办结 */
  }
}
</script>
