<template>
  <div class="w-full flex flex-col gap-4">
    <label class="text-white font-medium text-sm">
      {{ label }}
    </label>

    <div class="flex flex-row justify-between text-white">
      <ChevronLeft
        class="text-gray-200! hover:text-white! transition duration-150 cursor-pointer"
        @click="selectPrevious"
      />
      <p class="select-none text-sm">
        {{ model.name }}
      </p>

      <ChevronRight
        class="text-gray-200! hover:text-white! transition duration-150 cursor-pointer"
        @click="selectNext"
      />
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import { ref } from "vue";

const model = defineModel();

const props = defineProps({
  label: String,
  enabled: {
    type: Boolean,
    default: true,
  },
  options: Array,
});

const currentIndex = ref(0);

console.log("BaseSwitch options:", props.options);

function selectPrevious() {
  currentIndex.value =
    (currentIndex.value - 1 + props.options.length) % props.options.length;
  model.value = props.options[currentIndex.value];
}

function selectNext() {
  currentIndex.value = (currentIndex.value + 1) % props.options.length;
  model.value = props.options[currentIndex.value];
}
</script>
