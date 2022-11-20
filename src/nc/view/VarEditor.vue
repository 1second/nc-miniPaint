<script lang="ts" setup>
import { PropType, reactive, watchEffect, computed } from "vue";
import { TplVarManager } from "../tplVar";
import JsonTree from "./comps/JsonTree.vue";
import { JsonTreeCtx } from "./comps/JsonTree.vue";
const props = defineProps({
  paint: {
    type: Object as PropType<MiniPaintApp>,
    required: true,
  },
});
const manager = props.paint.AppConfig._tplVarManager as TplVarManager;

const jsonCtx: JsonTreeCtx = reactive({
  selected: undefined,
});
watchEffect(() => console.log(jsonCtx.selected));
const addVarForm = reactive({
  name: "",
  isExpression: false,
  type: "string",
  value: "",
});
const addVar = () => {
  const v = {
    name: addVarForm.name,
    type: addVarForm.type,
    value: addVarForm.value,
    expression: addVarForm.isExpression ? addVarForm.value : undefined,
  } as any;
  const err = manager.checkVar(v);
  if (err) {
    alert(err);
    return;
  }
  manager.addVar(v);
  Object.assign(addVarForm, {
    name: "",
    isExpression: false,
    type: "string",
    value: "",
  });
};
const addBindingForm = reactive({
  layerId: 0,
  varName: "",
});
const selectedLayer = computed(() => {
  return props.paint.AppConfig.layers.find(
    (v) => v.id === addBindingForm.layerId
  );
});
</script>

<template>
  <div>
    <ul class="tips">
      <li>* 变量名只能包含字母、数字、中文、下划线</li>
      <li>* 在渲染图片时，可以传递变量值覆盖默认值</li>
      <li>* 表达式是通过其他变量动态计算的值，因此渲染时不能传值覆盖</li>
    </ul>
    <table>
      <tr>
        <th>变量名</th>
        <th>类型</th>
        <th>值</th>
      </tr>
      <tr v-for="v in manager.tplVars" :key="v.name">
        <td>{{ v.name }}</td>
        <td>
          <span v-if="v.expression" class="tag"> 表达式 </span>
          {{ v.type }}
        </td>
        <td v-if="v.expression"></td>
        <td v-else>{{ v.value }}</td>
      </tr>
    </table>
    <div class="add-form">
      <input
        type="text"
        v-model="addVarForm.name"
        placeholder="变量名"
        @keyup.enter="addVar"
      />
      <select v-model="addVarForm.type">
        <option value="string">字符串</option>
        <option value="number">数字</option>
        <option value="boolean">布尔值</option>
        <option value="object">对象</option>
      </select>
      <span>是否表达式：</span>
      <input
        type="checkbox"
        v-model="addVarForm.isExpression"
        @change="addVarForm.value = ''"
      />
      <input
        type="text"
        v-model="addVarForm.value"
        placeholder="值"
        @keyup.enter="addVar"
      />
      <button @click="addVar">创建变量</button>
      <hr />
      <div style="max-height: 400px; overflow: auto">
        <JsonTree
          v-if="selectedLayer"
          :data="selectedLayer"
          :key="addBindingForm.layerId"
          :prop="''"
          path=""
          :ctx="jsonCtx"
          init-expanded
        />
      </div>
    </div>
    <div class="add-binding" style="display: flex">
      图层：
      <select v-model="addBindingForm.layerId">
        <option :value="layer.id" v-for="layer in paint.AppConfig.layers">
          {{ layer.name }}
        </option>
      </select>
      路径：
      <input
        type="text"
        readonly
        style="flex: 1"
        :value="jsonCtx.selected?.path"
      />
      变量：
      <select v-model="addBindingForm.varName">
        <option
          :value="v.name"
          v-for="v in paint.AppConfig._tplVarManager.tplVars"
        >
          {{ v.name }}
        </option>
      </select>
      <button disabled>绑定</button>
    </div>
  </div>
</template>

<style scoped>
button:disabled {
  visibility: visible;
}
.tips {
  color: #999;
  background-color: #eee;
  padding: 5px;
  border-radius: 5px;
  margin-bottom: 10px;
  list-style: none;
}
.tag {
  background-color: #e6e6e6;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
}
table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}
tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
