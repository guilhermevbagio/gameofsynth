<template>
  <div class="glass-container flex flex-col w-full">
    <label class="text-white font-medium text-sm">{{ label }}</label>

    <div class="flex items-center gap-4">
      <input
        v-model.number="modelValue"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        @input="$emit('update:modelValue', parseFloat($event.target.value))"
        class="slider flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-white/70"
      />
      <div class="text-white font-semibold text-lg w-16 text-right">
        {{ modelValue.toFixed(decimals) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
  label: {
    type: String,
    default: "Value",
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 0.1,
  },
  decimals: {
    type: Number,
    default: 2,
  },
});

const modelValue = defineModel();

defineEmits(["update:modelValue"]);
</script>

<style scoped>
.slider {
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.3) var(--value),
    rgba(255, 255, 255, 0.1) var(--value),
    rgba(255, 255, 255, 0.1) 100%
  );
  --value: calc(
    (var(--slider-value, 0) - var(--slider-min, 0)) /
      (var(--slider-max, 100) - var(--slider-min, 0)) * 100%
  );
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  width: 20px;
  height: 20px;
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.6);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  width: 20px;
  height: 20px;
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.6);
}

.slider::-moz-range-track {
  background: transparent;
  border: none;
}
</style>
