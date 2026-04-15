<template>
  <button
    :class="[
      'px-4 py-1 rounded',
      enabled ? color : 'bg-gray-300 text-gray-700',
    ]"
  >
    {{ label }}
  </button>
</template>

<script setup>
defineProps({
  label: String,
  enabled: {
    type: Boolean,
    default: true,
  },
  color: String,
});
</script>
