<template>
  <main class="page" v-if="trip">
    <TripHeader :trip="trip" />
    <div class="toolbar">
      <el-button @click="router.push('/trip/' + trip.id)">返回详情</el-button>
      <el-button @click="router.push('/share')">打开分享页</el-button>
      <el-button type="primary" plain @click="checklistStore.seedSampleItems(trip.id, trip.members)">填入示例事项</el-button>
    </div>
    <div class="band">
      同行人：{{ trip.members.join('、') || '（暂无）' }}
      <span class="muted">——负责人不在名单内的事项会进入下方待指派区并写明原因；数据自动保存在本机，关闭浏览器后再打开可继续处理。</span>
    </div>
    <ChecklistPanel :trip="trip" />
  </main>
  <main v-else class="page"><EmptyState title="旅行不存在" /></main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { useChecklistView } from '../hooks/useChecklistView';
import TripHeader from '../components/common/TripHeader.vue';
import ChecklistPanel from '../components/common/ChecklistPanel.vue';
import EmptyState from '../components/common/EmptyState.vue';

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const trip = computed(() => tripStore.trips.find((item) => item.id === route.params.id));
const { checklistStore } = useChecklistView(() => trip.value);
</script>
