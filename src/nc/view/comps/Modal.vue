<script lang="ts" setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: String,
});
const emit = defineEmits<{
  (event: "update:visible", v: boolean): void;
}>();
</script>
<template>
  <div class="modal-mask" v-show="props.visible">
    <div class="modal-container">
      <div class="modal-header">
        <slot name="header"> {{ props.title ?? "Modal" }} </slot>
      </div>
      <div class="modal-body">
        <slot name="default"> default body </slot>
      </div>
      <div class="modal-footer">
        <slot name="footer">
          <button
            class="modal-default-button"
            @click="emit('update:visible', false)"
          >
            OK
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>
<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  overflow: auto;
}
.modal-container {
  color: #000;
  width: 1000px;
  transform: translateY(100px);
  margin-bottom: auto;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}
.modal-header {
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
  font-size: 16px;
  color: #42b983;
  border-bottom: 1px solid #e9e9e9;
}
.modal-body {
  padding: 20px;
  line-height: 1.5;
}
.modal-footer {
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
  text-align: right;
  border-top: 1px solid #e9e9e9;
}
.modal-footer button {
  padding: 5px 20px;
}

</style>
