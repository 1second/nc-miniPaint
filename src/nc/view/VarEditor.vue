<script lang="ts" setup>
import { PropType, reactive, watchEffect, computed, watch, ref } from "vue";
import { TplVarManager } from "../tplVar";
import JsonTree from "./comps/JsonTree.vue";
import { JsonTreeCtx, NodeInfo } from "./comps/JsonTree.vue";
import { EditVarAction } from "../actions/EditVarAction";
import { VarBindingAction } from "../actions/VarBindingAction";
import { api } from "../api/api";
import LoadingArea from "./comps/LoadingArea.vue";
import { loadImage } from "../util";
const props = defineProps({
  paint: {
    type: Object as PropType<MiniPaintApp>,
    required: true,
  },
});
const loading = ref("");
const waitPromise = <T>(p: Promise<T>, text = "loading") => {
  loading.value = text;
  p.finally(() => (loading.value = ""));
  p.catch((e) => {
    console.error(e);
    alert(e.toString());
  });
  return p;
};
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
  imageFile: null as any,
});
watchEffect(() => console.log(addVarForm.imageFile));
const addVar = async () => {
  addVarForm.value = addVarForm.value.trim();
  const v: MiniPaint.TplVar = {
    name: addVarForm.name,
    type: addVarForm.type as any,
    value: addVarForm.value,
    expression: addVarForm.isExpression ? addVarForm.value : undefined,
    editLock: addVarForm.editLock ? true : undefined,
  } as any;
  if (v.type === "image") {
    let url = addVarForm.value;
    if (!url && addVarForm.imageFile) {
      url = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target!.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(addVarForm.imageFile);
      });
    }
    if (!url) {
      alert("请输入图片地址或选择本地图片文件");
      return;
    }

    if (url.startsWith("data:")) {
      const { dataUrl, img } = await waitPromise(loadImage(url), "图片加载中");
      v.value = img;
      v.data = dataUrl;
    } else {
      const { dataUrl } = await waitPromise(loadImage(url), "图片加载中");
      const { img } = await loadImage(dataUrl, false);
      v.value = img;
      v.data = dataUrl;
    }
  }
  const err = manager.checkVar(v, true);
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
    imageFile: null as any,
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
const getNodeTags = (node: NodeInfo) => {
  const tags = [] as { type: string; value: any }[];
  const layer = selectedLayer.value;
  if (!layer || !node.obj) return tags;
  const binding = manager.getBinding(node.obj, node.prop);
  if (binding) {
    tags.push({
      type: "binding",
      value: binding.varName,
    });
  }

  const data = node.obj[node.prop];
  if (data instanceof HTMLImageElement) {
    tags.push({
      type: "image",
      value: data,
    });
  }
  return tags;
};
</script>

<template>
  <LoadingArea :loading="!!loading" :loading-text="loading">
    <div>
      <ul class="tips">
        <li>* 变量名只能包含字母、数字、中文、下划线</li>
        <li>* 在渲染图片时，可以传递变量值覆盖默认值</li>
        <li>
          * 表达式是通过其他变量动态计算的值，因此渲染时不能传值覆盖。<a
            href="https://github.com/1second/nc-app-image-render/blob/master/doc/expr.md"
            target="_blank"
            >表达式使用说明</a
          >
        </li>
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
          <td v-else-if="v.type === 'image'">
            <a href="javascript:;" class="tag tag-img">
              {图片}
              <img :src="v.data" alt="" />
            </a>
          </td>
          <td v-else>{{ v.value }}</td>
          <td>{{ v.editLock ? "锁定" : "未锁定" }}</td>
        </tr>
      </table>
      <div class="add-form" style="display: flex">
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
          <option value="image">图片</option>
        </select>
        <span>是否表达式：</span>
        <input
          type="checkbox"
          v-model="addVarForm.isExpression"
          @change="addVarForm.value = ''"
        />
        <span>编辑锁定：</span>
        <input type="checkbox" v-model="addVarForm.editLock" />
        <label v-if="addVarForm.type === 'image'" class="input-file">
          {{ addVarForm.imageFile?.name || "选择图片文件" }}
          <input
            style="display: none"
            type="file"
            @change="e => addVarForm.imageFile = (e.target as any).files[0]"
            accept="image/*"
          />
        </label>

        <input
          type="text"
          style="flex: 1"
          v-model="addVarForm.value"
          placeholder="值"
          @keyup.enter="addVar"
        />
        <button @click="addVar">创建变量</button>
      </div>
    </div>
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
          <span v-for="tag in getNodeTags(nodeInfo)">
            <a
              href="javascript:;"
              @click.stop="clickUnbind(nodeInfo)"
              v-if="tag.type === 'binding'"
              class="tag"
              >{{ tag.value }}</a
            >
            <a
              href="javascript:;"
              v-else-if="tag.type === 'image'"
              class="tag tag-img"
            >
              {图片}
              <img :src="tag.value.src" alt="" />
            </a>
            <span v-else>{{ tag }}</span>
          </span>
        </template>
      </JsonTree>
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
  </LoadingArea>
</template>

<style scoped>
button:disabled {
  visibility: visible;
}

.tag-img {
  position: relative;
  color: red;
}
.tag-img img {
  max-width: 300px;
  object-fit: contain;
  position: absolute;
  display: none;
}
.tag-img:hover img {
  display: inline-block;
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
  margin-right: 5px;
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
