<script lang="ts" setup>
import Loading from "./Loading.vue";

const props = defineProps({
  loadingText: {
    type: String,
    default: "Loading...",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="loading-area">
    <slot></slot>
    <div class="loading-mask" v-show="props.loading">
      <Loading :loading-text="props.loadingText"></Loading>
    </div>
  </div>
</template>

<style scoped>
.loading-area {
  position: relative;
}
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
</style>
