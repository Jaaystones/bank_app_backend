<script setup lang="ts">
defineProps<{
  volume: number;
}>();

const emit = defineEmits(["update:volume"]);
</script>
<template>
  <div
    class="flex flex-row-reverse sm:flex-col items-center justify-center gap-2"
  >
    <input
      type="range"
      :value="volume"
      @input="
        emit(
          'update:volume',
          ($event.target as HTMLInputElement)?.value ?? '0.3'
        )
      "
      min="0"
      max="1"
      step="0.01"
      class="sm:vertical"
    />
    <div class="text-sm font-medium text-gray-700">
      {{ Math.round(volume * 100) }}%
    </div>
  </div>
</template>

<style scoped></style>
