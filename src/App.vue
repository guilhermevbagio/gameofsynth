<script setup lang="ts">
import { Image } from "@lucide/vue";
import Background from "./components/Background.vue";
import GameOfLife from "./GameOfLife.vue";
import IconButton from "./components/IconButton.vue";
import { ref } from "vue";

const backgroundEnabled = ref(true);
</script>

<template>
  <div class="absolute bottom-3 left-3 text-white">
    <IconButton
      class="*:w-10 *:h-10"
      :icon="Image"
      @click="backgroundEnabled = !backgroundEnabled"
    />
  </div>

  <div class="absolute w-full h-screen bg-black -z-10">
    <Background
      v-if="backgroundEnabled"
      class="opacity-30"
      :wave-speed="0.01"
      :wave-frequency="1"
      :wave-amplitude="0.7"
      :wave-color="[0.1, 0.1233, 0.1233]"
      :color-num="4"
      :pixel-size="4"
      :disable-animation="false"
      :enable-mouse-interaction="true"
      :mouse-radius="1"
    />
  </div>

  <GameOfLife />
</template>
