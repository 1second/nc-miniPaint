<script lang="ts" setup>
import { computed, reactive } from "vue";
import LoadingArea from "./LoadingArea.vue";
import { api } from "../../api/api";
const props = defineProps({
  filename: {
    type: String,
    required: true,
  },
});
const defaultTplVarInput = localStorage.tplVarInput || `
{
    "水印文字": "一秒科技"
}
`;
const templateList = computed(() => {
  return [props.filename];
});

const state = reactive({
  loading: false,
  selectedTemplate: props.filename,
  tplVarInput: defaultTplVarInput,
  renderedImgUrl: "",
});
const clickRender = async () => {
  let tplVar: any;
  try {
    tplVar = JSON.parse(state.tplVarInput);
  } catch (error: any) {
    alert("json 格式不合法： " + error.toString());
    return;
  }
  state.loading = true;
  state.renderedImgUrl = await api
    .renderTemplate(state.selectedTemplate, tplVar)
    .finally(() => (state.loading = false));
  localStorage.tplVarInput = state.tplVarInput;
};
</script>

<template>
  <LoadingArea :loading="state.loading">
    模板:
    <select v-model="state.selectedTemplate">
      <option v-for="tpl in templateList" :value="tpl">{{ tpl }}</option>
    </select>
    <button @click="clickRender">渲染</button>
    <textarea
      v-model="state.tplVarInput"
      rows="10"
      style="display: block; width: 100%; padding: 10px; margin-bottom: 10px"
    />
    <div style="display: flex">
      渲染结果图地址:
      <input
        style="flex: 1"
        type="text"
        readonly
        :value="state.renderedImgUrl"
      />
    </div>
    <a :href="state.renderedImgUrl" v-if="state.renderedImgUrl" target="_blank">
      <img :src="state.renderedImgUrl" style="max-width: 100%" />
    </a>
  </LoadingArea>
</template>

<style scoped></style>
