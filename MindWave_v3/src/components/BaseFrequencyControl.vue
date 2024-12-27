<script setup lang="ts">
defineProps<{
  modelValue: number;
}>();

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="w-full">
    <label class="block text-sm text-center text-slate-800"
      >Base Note: {{ Math.floor(modelValue * 10) / 10 }}Hz</label
    >
    <input
      type="range"
      :value="modelValue"
      @input="$event => emit('update:modelValue', (($event.target as HTMLInputElement).value))"
      min="20"
      max="500"
      class="w-full"
    />
  </div>
</template>
