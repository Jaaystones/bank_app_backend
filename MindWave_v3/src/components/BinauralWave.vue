<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import VolumeControl from "./VolumeControl.vue";
import BaseFrequencyControl from "./BaseFrequencyControl.vue";
import TabContainer from "./TabContainer.vue";
import BaseFreqKeys from "./BaseFreqKeys.vue";

const audioContext = ref<AudioContext | null>(null);
const oscillatorLeft = ref<OscillatorNode | null>(null);
const oscillatorRight = ref<OscillatorNode | null>(null);
const gainNode = ref<GainNode | null>(null);
const isPlaying = ref(false);

const baseFrequency = ref(260);
const frequencyDiff = ref(6);
const volume = ref(0.5);

const initAudio = () => {
  audioContext.value = new AudioContext();

  oscillatorLeft.value = audioContext.value.createOscillator();
  oscillatorRight.value = audioContext.value.createOscillator();

  const pannerLeft = audioContext.value.createStereoPanner();
  const pannerRight = audioContext.value.createStereoPanner();
  pannerLeft.pan.value = -1;
  pannerRight.pan.value = 1;

  gainNode.value = audioContext.value.createGain();
  gainNode.value.gain.setValueAtTime(0, audioContext.value.currentTime);

  oscillatorLeft.value.connect(pannerLeft);
  oscillatorRight.value.connect(pannerRight);
  pannerLeft.connect(gainNode.value);
  pannerRight.connect(gainNode.value);
  gainNode.value.connect(audioContext.value.destination);

  updateFrequencies();
  updateVolume();

  oscillatorLeft.value.start();
  oscillatorRight.value.start();
};

const updateFrequencies = () => {
  if (!oscillatorLeft.value || !oscillatorRight.value || !audioContext.value)
    return;

  const currentTime = audioContext.value.currentTime;
  oscillatorLeft.value.frequency.setValueAtTime(
    baseFrequency.value,
    currentTime
  );
  oscillatorRight.value.frequency.setValueAtTime(
    baseFrequency.value + frequencyDiff.value,
    currentTime
  );
};

// Frequency sweep variables
const sweepStart = ref(1); // Minimum binaural frequency
const sweepEnd = ref(50); // Maximum binaural frequency
const sweepInterval = ref<number | null>(null);
//const sweepSpeed = ref(500); Sweep speed in milliseconds
const isSweeping = ref(false);
const timerDuration = ref(0); // Timer duration in seconds
const timerInterval = ref<number | null>(null); // Reference to the timer interval

const selectedDuration = ref(60); // Default timer duration in seconds

const activateGain = () => {
  if (gainNode.value && audioContext.value) {
    gainNode.value.gain.setValueAtTime(volume.value, audioContext.value.currentTime);
  }
};

const deactivateGain = () => {
  if (!gainNode.value || !audioContext.value) return;

  const currentTime = audioContext.value.currentTime;
  gainNode.value.gain.cancelScheduledValues(currentTime);
  gainNode.value.gain.setValueAtTime(gainNode.value.gain.value, currentTime);
  gainNode.value.gain.linearRampToValueAtTime(0, currentTime + 0.5); // Smoothly fade out over 0.5 seconds

  // Optionally suspend the audio context after the fade-out
  setTimeout(() => {
  if (audioContext.value) {
    audioContext.value.suspend();
  } else {
    console.warn("audioContext.value is null or undefined during suspend.");
  }
}, 500);
};

const stopSweep = () => {
  // Clear the sweep interval
  if (sweepInterval.value) {
    window.clearInterval(sweepInterval.value);
    sweepInterval.value = null;
  }

  // Clear the timer interval
  if (timerInterval.value) {
    window.clearInterval(timerInterval.value);
    timerInterval.value = null;
  }

  isSweeping.value = false;
  deactivateGain(); // Ensure audio is stopped
};

const startSweep = () => {
  if (isSweeping.value || sweepStart.value >= sweepEnd.value) return;

  // Start playback if not already started
  if (!isPlaying.value) {
    togglePlay();
  }

  activateGain(); // Ensure gain node is active

  isSweeping.value = true;
  frequencyDiff.value = sweepStart.value;

  // Initialize the timer duration
  timerDuration.value = selectedDuration.value;

  // Start the timer logic
  timerInterval.value = window.setInterval(() => {
    if (timerDuration.value > 0) {
      timerDuration.value -= 1; // Decrease timer every second
    } else {
      stopSweep(); // Stop everything when time elapses
    }
  }, 1000);

  // Calculate the sweeping logic
  const totalSteps = Math.ceil((sweepEnd.value - sweepStart.value) / 1);
  const totalDuration = selectedDuration.value * 1000; // Convert seconds to milliseconds
  const dynamicSweepSpeed = totalDuration / totalSteps;

  // Start the frequency sweeping
  sweepInterval.value = window.setInterval(() => {
    if (frequencyDiff.value >= sweepEnd.value) {
      stopSweep(); // Stop when the frequency range is complete
    } else {
      frequencyDiff.value += 1; // Increment the frequency difference
      updateFrequencies(); // Update the frequencies accordingly
    }
  }, dynamicSweepSpeed);
};

// const stopTimer = () => {
//   // Clear the timer interval
//   if (timerInterval.value) {
//     window.clearInterval(timerInterval.value);
//     timerInterval.value = null;
//   }
// };


function updateVolume() {
  if (!gainNode.value || !audioContext.value) return;

  const currentTime = audioContext.value.currentTime;
  gainNode.value.gain.linearRampToValueAtTime(volume.value, currentTime + 0.2);
}

watch([baseFrequency, frequencyDiff], () => {
  updateFrequencies();
});

watch(volume, () => {
  updateVolume();
});

const fadeGainPromise = (gain: number, sec: number) => {
  return new Promise((resolve) => {
    if (!audioContext.value) return;
    gainNode.value?.gain.linearRampToValueAtTime(
      gain,
      audioContext.value.currentTime + sec
    );
    setTimeout(() => {
      resolve(true);
    }, sec * 1000);
  });
};

const onOffFade = 0.8;
const togglePlay = async () => {
  if (!audioContext.value) {
    await initAudio();
    if (!audioContext.value) return;
  }

  const stop = isPlaying.value;
  if (stop) {
    fadeGainPromise(0, onOffFade).then(() => audioContext.value?.suspend());
  } else {
    gainNode.value?.gain.setValueAtTime(0, audioContext.value.currentTime);
    audioContext.value
      .resume()
      .then(() => fadeGainPromise(volume.value, onOffFade));
  }
  isPlaying.value = !isPlaying.value;
};

const onKeyPress = (ev: KeyboardEvent) => {
  if (ev.code === "Space") {
    // togglePlay();
  }
};

onMounted(() => {
  window.addEventListener("keydown", onKeyPress);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyPress);

  if (audioContext.value) {
    audioContext.value.close();
  }
});

const bands = {
  delta: 4,
  theta: 8,
  alpha: 13,
  beta: 30,
  gamma: 50,
};

const bandKeys = Object.keys(bands) as (keyof typeof bands)[];

const currentBand = computed(() => {
  for (const key of bandKeys) {
    if (frequencyDiff.value < bands[key]) return key;
  }
  return "";
});
</script>


<template>
  <div class="controls sm:grid grid-cols-[auto_80px] gap-2">
    <div class="row-span-2 xxxmax-w-[550px] space-y-4">
      <div class="sm:border border-gray-300 sm:p-4">
        <div class="flex mb-3 items-center gap-4">
          <h2 class="text-lg">Binaural Frequency</h2>
        </div>
        <div class="mb-3">
          <label class="block text-center text-slate-800" for="freqdiff">
            {{ frequencyDiff }}Hz</label
          >
          <input
            type="range"
            id="freqdiff"
            v-model.number="frequencyDiff"
            min="1"
            max="50"
            class="w-full"
          />
        </div>
        <div class="flex flex-wrap divide-x divide-solid divide-gray-400">
          <div
            v-for="[band, max] in Object.entries(bands)"
            :key="band"
            class="grow px-4 flex-[1_0_auto]"
            :class="{
              'bg-blue-100': currentBand === band,
              'bg-gray-100': currentBand !== band,
            }"
          >
            <div class="py-1 text-center flex flex-col text-sm">
              <span>
                {{ band }}
              </span>
              <span> {{ `< ${max} Hz` }}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
      <h2 class="text-lg font-bold text-center mb-3">Frequency Range</h2>

      <!-- Sweep Start Frequency Slider -->
      <div class="mb-3">
        <label for="sweepStart" class="block text-center text-slate-800">
          Minimum Frequency: {{ sweepStart }}Hz
        </label>
        <input
          type="range"
          id="sweepStart"
          v-model.number="sweepStart"
          min="1"
          max="50"
          step="1"
          class="w-full"
        />
      </div>

      <!-- Sweep End Frequency Slider -->
      <div class="mb-3">
        <label for="sweepEnd" class="block text-center text-slate-800">
          Maximum Frequency: {{ sweepEnd }}Hz
        </label>
        <input
          type="range"
          id="sweepEnd"
          v-model.number="sweepEnd"
          min="1"
          max="50"
          step="1"
          class="w-full"
        />
      </div>

      <!-- Start and Stop Sweep Buttons -->
      <div class="text-center">
        <button
          @click="startSweep"
          :disabled="isSweeping"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Start Sweep
        </button>
        <button
          @click="stopSweep"
          :disabled="!isSweeping"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-3"
        >
          Stop Sweep
        </button>
      </div>

      <div class="mt-4 sm:border border-gray-300 sm:p-4">
        <h2 class="text-lg font-bold text-center mb-3">Timer</h2>
        <div>
          <label for="timer" class="block text-center text-slate-800">
            Duration: {{ selectedDuration }} seconds
          </label>
          <input
            type="range"
            id="timer"
            v-model.number="selectedDuration"
            min="5"
            max="300"
            step="5"
            class="w-full"
          />
        </div>
      </div>

      <div class="text-center mt-4">
          <p class="text-lg font-bold">Time Remaining: {{ timerDuration }}s</p>
      </div>

      
    </div>
      <div class="sm:border border-gray-300 sm:p-2 relative">
        <TabContainer :tabs="['Notes', 'Hz']">
          <template #header>
            <h2 class="text-lg leading-tight mb-1">Base Frequency</h2>
          </template>
          <template #Hz>
            <div class="grow grid place-items-center">
              <BaseFrequencyControl v-model.number="baseFrequency" />
            </div>
          </template>
          <template #Notes>
            <BaseFreqKeys v-model.number="baseFrequency" />
          </template>
        </TabContainer>
      </div>
    </div>
    <VolumeControl v-model:volume.number="volume" />
    <div class="place-self-center">
      <button
        @click="togglePlay"
        class="size-14 sm:size-16 rounded-full bg-blue-500 text-white sm:text-lg hover:bg-blue-600 transition-colors"
      >
        {{ isPlaying ? "Stop" : "Start" }}
      </button>
    </div>
  </div>
</template>