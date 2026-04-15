<template>
  <div class="w-full h-full flex flex-row justify-between items-center p-4">
    <main class="flex justify-center w-full">
      <div
        class="grid gap-0 shadow-lg"
        :style="{ gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))` }"
      >
        <div v-for="(row, i) in synthGrid" :key="i">
          <div
            v-for="(cell, j) in row"
            :key="j"
            class=""
            :class="[
              'w-14 h-14 transition duration-50 ease-in-out border  hover:bg-teal-200/80 cursor-pointer flex items-center justify-center text-xs',
              ticking ? 'border-teal-100/20' : 'border-white/35',
              cell ? 'bg-teal-200 glow-white-sm' : 'bg-black/30',
            ]"
            @click="toggleCell(i, j)"
          >
            <p v-if="!ticking" class="text-white">
              {{ noteMatrix[j][i].name }}
            </p>
          </div>
        </div>
      </div>
    </main>

    <aside
      class="w-[25%] absolute right-0 my-4 rounded border h-full flex flex-col gap-4 justify-start items-start p-4"
    >
      <div class="flex flex-row justify-between w-full glass-container">
        <IconButton
          :icon="Pause"
          :enabled="ticking"
          color="text-gray-200! hover:text-white! "
          @click="pause"
        />
        <IconButton
          :icon="Play"
          :enabled="!ticking"
          color="text-gray-200! hover:text-white!"
          @click="play"
        />

        <IconButton
          :icon="Trash"
          color="text-red-300! hover:text-red-400! text-white"
          @click="clear"
        />
      </div>

      <BaseSlider
        class="glass-container"
        :class="ticking ? 'blocked' : ''"
        v-model="BPM"
        label="BPM"
        :min="40"
        :max="240"
        :step="0.1"
        :decimals="2"
      />

      <BaseSlider
        class="glass-container"
        :class="ticking ? 'blocked' : ''"
        v-model="gridHeight"
        label="Grid Size"
        :min="4"
        :max="16"
        :step="1"
        :decimals="0"
      />

      <div class="glass-container w-full flex flex-col gap-4">
        <p class="text-white text-sm font-medium">Sequencer</p>
        <span class="flex flex-row gap-1 w-full h-12">
          <div
            v-for="i in 8"
            :key="i"
            class="border-2 cursor-pointer hover:bg-gray-900 border-gray-800 transition duration-150 ease-in-out w-12! h-12! p-0! rounded"
            :class="[
              sequencer[i - 1]
                ? currentStep === i - 1
                  ? 'bg-white border-white glow-white-sm'
                  : 'bg-gray-800'
                : '',
            ]"
            @click="toggleSequence(i - 1)"
          ></div>
        </span>
      </div>

      <Synth ref="synthRef" />

      <BaseSwitch label="Mapping" :options="LAYOUTS" v-model="layoutMapping" />
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import BaseSlider from "./components/BaseSlider.vue";
import IconButton from "./components/IconButton.vue";
import { Pause, Play, Trash } from "@lucide/vue";
import Synth from "./components/Synth.vue";
import BaseSwitch from "./components/BaseSwitch.vue";
import { createNoteMapper, LAYOUTS, LAYOUTS_MAP } from "./utils/noteUtils.js";

const layoutMapping = ref(LAYOUTS_MAP.WHOLE_TONE);

const mapper = computed(() =>
  createNoteMapper({
    root: "A2",
    ...layoutMapping.value,
  }),
);

const getNote = (x, y) => mapper.value.getNote(x, y);

const gridHeight = ref(6);
const gridWidth = computed(() => gridHeight.value);

const BPM = ref(120);

const synthRef = ref(null);

const sequencer = ref([true, true, true, true, true, true, true, true]);
const currentStep = ref(0);

const noteMatrix = computed(() =>
  mapper.value.buildMatrix(gridHeight.value, gridWidth.value),
);

const synthGrid = ref(
  Array.from({ length: gridHeight.value }, () =>
    Array.from({ length: gridWidth.value }, () => false),
  ),
);

watch(gridHeight, (newHeight) => {
  synthGrid.value = Array.from({ length: newHeight }, () =>
    Array.from({ length: newHeight }, () => false),
  );

  console.log(`Grid resized to ${newHeight}x${newHeight}`);
});

let tickInterval = null;
const ticking = ref(false);

onMounted(() => {});

function play() {
  tickInterval = setInterval(tick, 60000 / BPM.value / 2);
  ticking.value = true;
}

function pause() {
  clearInterval(tickInterval);
  synthRef.value?.stopAllNotes();
  ticking.value = false;
}

function toggleCell(i, j) {
  synthGrid.value[i][j] = !synthGrid.value[i][j];
  playNote(i, j);
  setTimeout(() => {
    stopNote(i, j);
  }, 200);
}

function tick() {
  console.log("Tick");

  currentStep.value = (currentStep.value + 1) % 8;

  if (!sequencer.value[currentStep.value]) {
    return;
  }

  for (let i = 0; i < gridHeight.value; i++) {
    for (let j = 0; j < gridWidth.value; j++) {
      const alive = synthGrid.value[i][j];

      const neighbours = checkNeighbours(i, j);
      if (alive && (neighbours < 2 || neighbours > 3)) {
        synthGrid.value[i][j] = false;
        stopNote(i, j);
      } else if (!alive && neighbours === 3) {
        synthGrid.value[i][j] = true;
        playNote(i, j);
      }
    }
  }
}

function checkNeighbours(i, j) {
  let count = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      if (x === 0 && y === 0) continue;
      const ni =
        (((i + x) % gridHeight.value) + gridHeight.value) % gridHeight.value;
      const nj =
        (((j + y) % gridWidth.value) + gridWidth.value) % gridWidth.value;
      if (synthGrid.value[ni][nj]) count++;
    }
  }
  return count;
}

function playNote(x, y) {
  getNote(x, y);

  synthRef.value?.playNote(getNote(x, y).freq);
}

function stopNote(x, y) {
  getNote(x, y);

  synthRef.value?.stopNote(getNote(x, y).freq);
}

function clear() {
  synthGrid.value = Array.from({ length: gridHeight.value }, () =>
    Array.from({ length: gridWidth.value }, () => false),
  );

  currentStep.value = 0;
  pause();
}

function toggleSequence(index) {
  sequencer.value[index] = !sequencer.value[index];
}
</script>
