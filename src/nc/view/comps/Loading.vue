<script lang="ts" setup>
const props = defineProps({
  loadingText: {
    type: String,
    default: "Loading...",
  },
});
</script>

<template>
  <div class="loading">
    <div class="loading-spinner"></div>
    <div class="loading-text">
        {{ props.loadingText }}
    </div>
  </div>
</template>

<style scoped>
.loading {
  color: #3498db;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
