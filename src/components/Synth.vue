<template>
  <div class="glass-container space-y-6 w-full">
    <h2 class="text-white text-sm font-medium">Synth</h2>

    <div class="space-y-3">
      <label class="text-white/80 text-sm">Waveform</label>
      <div class="flex gap-2">
        <button
          v-for="wave in waveforms"
          :key="wave"
          @click="waveform = wave"
          :class="[
            'px-4 py-2 rounded transition-all',
            waveform === wave
              ? 'bg-white/30 border border-white/50 text-white glow-white-sm'
              : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/15',
          ]"
        >
          {{ wave }}
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <BaseSlider
        v-model.number="attack"
        label="Attack"
        :min="0"
        :max="2"
        :step="0.01"
      />

      <BaseSlider
        v-model.number="release"
        label="Release"
        :min="0"
        :max="2"
        :step="0.01"
      />

      <BaseSlider
        v-model.number="volume"
        label="Volume"
        :min="0"
        :max="1"
        :step="0.01"
      />

      <BaseSlider
        v-model.number="lpFreq"
        label="Low Pass "
        :min="20"
        :max="20000"
        :step="1"
      />

      <BaseSlider
        v-model.number="hpFreq"
        label="High Pass "
        :min="20"
        :max="20000"
        :step="1"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import BaseSlider from "./BaseSlider.vue";

const audioContext = ref(null);
const oscillator = ref(null);
const gainNode = ref(null);

const waveform = ref("sine");
const waveforms = ["sine", "square", "sawtooth", "triangle"];
const attack = ref(0.05);
const release = ref(0.3);
const volume = ref(0.3);

const lpFilter = ref(null);
const hpFilter = ref(null);

const lpFreq = ref(8000);
const hpFreq = ref(80);

watch(lpFreq, (val) => {
  if (lpFilter.value) lpFilter.value.frequency.value = val;
});
watch(hpFreq, (val) => {
  if (hpFilter.value) hpFilter.value.frequency.value = val;
});

const initFilters = (ctx) => {
  lpFilter.value = ctx.createBiquadFilter();
  lpFilter.value.type = "lowpass";
  lpFilter.value.frequency.value = lpFreq.value;
  lpFilter.value.Q.value = 1;

  hpFilter.value = ctx.createBiquadFilter();
  hpFilter.value.type = "highpass";
  hpFilter.value.frequency.value = hpFreq.value;
  hpFilter.value.Q.value = 1;

  lpFilter.value.connect(hpFilter.value);
  hpFilter.value.connect(ctx.destination);
};

const initAudioContext = () => {
  if (!audioContext.value) {
    audioContext.value = new (
      window.AudioContext || window.webkitAudioContext
    )();
  }
};

const playNote = (frequency) => {
  initAudioContext();
  const ctx = audioContext.value;
  initFilters(ctx);

  // Stop previous note
  if (oscillator.value) {
    stopNote();
  }

  oscillator.value = ctx.createOscillator();
  gainNode.value = ctx.createGain();

  oscillator.value.connect(gainNode.value);
  gainNode.value.connect(lpFilter.value);

  oscillator.value.type = waveform.value;
  oscillator.value.frequency.value = frequency;

  // ADSR envelope
  gainNode.value.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.value.gain.linearRampToValueAtTime(
    volume.value,
    ctx.currentTime + attack.value,
  );

  oscillator.value.start(ctx.currentTime);
};

const stopNote = () => {
  if (oscillator.value && gainNode.value && audioContext.value) {
    const ctx = audioContext.value;
    gainNode.value.gain.setValueAtTime(
      gainNode.value.gain.value,
      ctx.currentTime,
    );
    gainNode.value.gain.linearRampToValueAtTime(
      0,
      ctx.currentTime + release.value,
    );
    oscillator.value.stop(ctx.currentTime + release.value);
    oscillator.value = null;
  }
};

const stopAllNotes = () => {
  if (oscillator.value) {
    stopNote();
  }
};

defineExpose({
  playNote,
  stopNote,
  stopAllNotes,
});
</script>

<style scoped>
input[type="range"] {
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0.3)
  );
}
</style>
