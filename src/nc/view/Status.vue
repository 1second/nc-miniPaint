<script lang="ts" setup>
import { reactive, toRefs, computed } from "vue";
import { api } from "../api/api";
import { wrapAsync, deepCopy } from "../util";
import Loading from "./comps/Loading.vue";
import { useAutoSave } from "../hook";
import Modal from "./comps/Modal.vue";
import VarEditor from "./VarEditor.vue";
import { evalMiniPaintJson } from "../tplEval";
const props = defineProps<{
  filename: string;
  paint: MiniPaintApp;
}>();

const state = reactive({
  loadingError: null as string | null,
  loading: false,
  loaded: false,
  autoSave: true,
  showVarEditor: false,
});

const autoSave = useAutoSave(
  props.filename,
  props.paint,
  computed(() => state.autoSave && state.loaded)
);

let loadAndOpen = async () => {
  const tpl = await api.getTemplate(props.filename);
  await props.paint.FileOpen.load_json(tpl);
  props.paint.State.reset();
  state.loaded = true;
};

loadAndOpen = wrapAsync(
  loadAndOpen,
  toRefs(state).loading,
  toRefs(state).loadingError
);

loadAndOpen();

const clickVarToValue = async () => {
  const s = props.paint.FileSave.export_as_json();
  const tpl = await evalMiniPaintJson(JSON.parse(s));
  console.log(JSON.parse(s), tpl);
  await props.paint.FileOpen.load_json(deepCopy(tpl));
};
</script>
<template>
  <div>
    <div class="loading-mask" v-if="!state.loaded">
      <Loading v-show="state.loading" />
      <div v-show="!state.loading && state.loadingError">
        <pre style="color: red">加载模板错误： {{ state.loadingError }}</pre>
        <a href="javascript:;" @click="loadAndOpen">重试</a>
      </div>
    </div>

    <div class="status-bar">
      <button @click="clickVarToValue">变量转值</button>
      <div class="auto-save">
        <input
          id="auto-save-checkbox"
          type="checkbox"
          v-model="state.autoSave"
          :disabled="!state.loaded"
        />
        <label for="auto-save-checkbox">自动保存</label>
      </div>
      <div class="vertical-border" />
      <div class="save-tip">
        <span v-if="autoSave.saving"> 正在保存 </span>
        <span v-else>
          {{
            autoSave.unsavedOpCnt
              ? `${autoSave.unsavedOpCnt}个操作未保存`
              : "所有操作已保存"
          }}
        </span>
        <a
          href="javascript:;"
          class="text-btn"
          v-show="!autoSave.saving && autoSave.unsavedOpCnt"
          @click="autoSave.save"
          >保存</a
        >
        <span
          v-show="autoSave.savingError && !autoSave.saving"
          style="color: red"
          >保存失败 {{ autoSave.savingError }}</span
        >
      </div>
      <div class="vertical-border" />
      <div class="ops">
        <button @click="state.showVarEditor = true">模板变量</button>
      </div>
      <div class="vertical-border" />
      <div class="filename">
        {{ props.filename }}
      </div>
    </div>
    <Modal
      visible
      @update:visible="state.showVarEditor = $event"
      v-if="state.showVarEditor"
      title="编辑模板变量"
    >
      <VarEditor :paint="props.paint" />
    </Modal>
  </div>
</template>
<style scoped>
* {
  box-sizing: border-box;
}
.status-bar {
  display: flex;
}

.vertical-border::after {
  content: ".";
  color: transparent;
  display: block;
  width: 1px;
  height: 100%;
  margin: 0 10px;
  background-color: #ccc;
}
input[type="checkbox"] {
  margin: 0 5px;
}
label {
  margin: 0;
  user-select: none;
}
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
}
</style>
