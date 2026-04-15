<template>
  <button
    :class="[
      'p-2 rounded cursor-pointer transition duration-150',
      enabled ? [color, 'hover:scale-120'] : 'text-gray-700',
    ]"
  >
    <component :is="icon" class="w-5 h-5" />
  </button>
</template>

<script setup>
defineProps({
  icon: Function,
  enabled: {
    type: Boolean,
    default: true,
  },
  color: String,
});
</script>
