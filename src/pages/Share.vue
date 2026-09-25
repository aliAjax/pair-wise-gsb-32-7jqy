<template>
  <main class="page">
    <TripHeader v-if="trip" :trip="trip" />
    <DayTimeline v-for="day in dayPlanStore.dayPlans" :key="day.id" :day="day" :spots="spotStore.spots" />
    <template v-if="trip">
      <h2>准备清单</h2>
      <PrepChecklist :sections="prepSections" :members="trip.members" readonly />
    </template>
    <el-button @click="copyText">复制行程文本</el-button>
  </main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { usePrepStore } from '../stores/prepStore';
import { usePrepList, emptyPrepSections } from '../hooks/usePrepList';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import PrepChecklist from '../components/common/PrepChecklist.vue';
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const prepStore = usePrepStore();
const trip = computed(() => tripStore.trips[0]);
const prepSections = computed(() => (trip.value ? usePrepList(trip.value, prepStore.items) : emptyPrepSections()));
function copyText() {
  const open = [...prepSections.value.pending, ...prepSections.value.todo]
    .map((item) => `□ ${item.title}（${item.unassigned ? '待指派' : item.assignee}${item.deadline ? '，截止 ' + item.deadline : ''}）`)
    .join('\n');
  const text = 'TripWeaver 行程单：' + (trip.value?.title || '未命名') + (open ? '\n准备事项：\n' + open : '');
  navigator.clipboard?.writeText(text);
}
</script>
