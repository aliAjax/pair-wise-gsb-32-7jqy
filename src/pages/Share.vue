<template>
  <main class="page">
    <EmptyState v-if="!tripStore.trips.length" title="还没有旅行计划" :description="messages.emptyTrips" />
    <template v-else-if="trip">
      <div class="toolbar">
        <el-select v-model="selectedId" style="width: 240px">
          <el-option v-for="item in tripStore.trips" :key="item.id" :label="item.title" :value="item.id" />
        </el-select>
        <el-button type="primary" @click="copyText">复制行程文本（含准备清单）</el-button>
      </div>
      <TripHeader :trip="trip" />
      <DayTimeline v-for="day in tripDays" :key="day.id" :day="day" :spots="spotStore.spots" />
      <ChecklistPanel :trip="trip" readonly />
    </template>
  </main>
</template>
<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { useChecklistView } from '../hooks/useChecklistView';
import { buildShareText } from '../utils/checklist';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import ChecklistPanel from '../components/common/ChecklistPanel.vue';

const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const selectedId = ref(tripStore.trips[0]?.id || '');

watchEffect(() => {
  if (!selectedId.value && tripStore.trips.length) selectedId.value = tripStore.trips[0].id;
});

const trip = computed(() => tripStore.trips.find((item) => item.id === selectedId.value));
const tripDays = computed(() => dayPlanStore.dayPlans.filter((day) => day.trip_id === selectedId.value));
const { view } = useChecklistView(() => trip.value);

function copyText() {
  if (!trip.value) return;
  const text = 'TripWeaver 行程单：' + trip.value.title + '\n\n' + buildShareText(trip.value.title, view.value);
  navigator.clipboard
    ?.writeText(text)
    .then(() => toast.ok(messages.checklistCopied))
    .catch(() => toast.fail(messages.copyFailed));
}
</script>
