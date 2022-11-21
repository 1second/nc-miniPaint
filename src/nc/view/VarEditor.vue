<script lang="ts" setup>
import { PropType, reactive, watchEffect, computed, watch } from "vue";
import { TplVarManager } from "../tplVar";
import JsonTree from "./comps/JsonTree.vue";
import { JsonTreeCtx, NodeInfo } from "./comps/JsonTree.vue";
import { EditVarAction } from "../actions/EditVarAction";
import { VarBindingAction } from "../actions/VarBindingAction";
const props = defineProps({
  paint: {
    type: Object as PropType<MiniPaintApp>,
    required: true,
  },
});
const manager = props.paint.AppConfig._tplVarManager as TplVarManager;

const jsonCtx: JsonTreeCtx = reactive({
  selected: undefined,
  filterProps: (obj: any, prop: string) => {
    if (prop === "$tplVarBindings") return false;
    return true;
  },
});
const addVarForm = reactive({
  name: "",
  isExpression: false,
  type: "string",
  value: "",
  editLock: false,
});
const addVar = () => {
  const v: MiniPaint.ObjectTplVar = {
    name: addVarForm.name,
    type: addVarForm.type as any,
    value: addVarForm.value,
    expression: addVarForm.isExpression ? addVarForm.value : undefined,
    editLock: addVarForm.editLock ? true : undefined,
  };
  const err = manager.checkVar(v);
  if (err) {
    alert(err);
    return;
  }
  EditVarAction.runEdit(props.paint, () => manager.addVar(v));
  Object.assign(addVarForm, {
    name: "",
    isExpression: false,
    type: "string",
    value: "",
    editLock: false,
  });
};
const addBindingForm = reactive({
  layerId: 0,
  varName: "",
});
watch(
  () => addBindingForm.layerId,
  () => (jsonCtx.selected = undefined)
);
const selectedLayer = computed(() => {
  return props.paint.AppConfig.layers.find(
    (v) => v.id === addBindingForm.layerId
  );
});
const clickAddBinding = () => {
  const sel = jsonCtx.selected;
  if (!sel) {
    alert("先选中一个绑定目标");
    return;
  }
  const err = manager.checkBinding(addBindingForm.varName, sel.obj, sel.prop);
  if (err) {
    alert(err);
    return;
  }
  props.paint.State.do_action(
    new VarBindingAction(manager, sel.obj, sel.prop, addBindingForm.varName)
  );
  jsonCtx.selected?.rerender();
};
const clickUnbind = (node: NodeInfo) => {
  props.paint.State.do_action(
    new VarBindingAction(manager, node.obj, node.prop, null)
  );
};
const getNodeBinding = (node: NodeInfo) => {
  const layer = selectedLayer.value;
  if (!layer) return undefined;
  return manager.getBinding(node.obj, node.prop);
};
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
        <th>编辑锁定</th>
      </tr>
      <tr v-for="v in manager.tplVars" :key="v.name">
        <td>{{ v.name }}</td>
        <td>
          <span v-if="v.expression" class="tag"> 表达式 </span>
          {{ v.type }}
        </td>
        <td v-if="v.expression"></td>
        <td v-else>{{ v.value }}</td>
        <td>{{ v.editLock ? "锁定" : "未锁定" }}</td>
      </tr>
    </table>
    <div class="add-form">
      变量名：
      <input
        type="text"
        v-model="addVarForm.name"
        placeholder="变量名"
        @keyup.enter="addVar"
      />
      类型：
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
      <span>编辑锁定：</span>
      <input type="checkbox" v-model="addVarForm.editLock" />
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
          :seq="manager.bindingSeq.value"
        >
          <template #pre-desc="{ nodeInfo }">
            <a
              href="javascript:;"
              @click.stop="clickUnbind(nodeInfo)"
              v-if="getNodeBinding(nodeInfo)"
              class="tag"
              >{{ getNodeBinding(nodeInfo)?.varName }}</a
            >
          </template>
        </JsonTree>
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
      <button @click="clickAddBinding">绑定</button>
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
