<script lang="ts" setup>
import {
  PropType,
  reactive,
  computed,
  ref,
  inject,
  provide,
  markRaw,
} from "vue";

export type JsonTreeCtx = {
  selected?: {
    path: string;
    obj: any;
    prop: string;
    rerender: () => void;
  };
  filterProps: (obj: any, prop: string) => boolean;
};
export type NodeInfo = {
  path: string;
  obj: any;
  prop: string;
  rerender: () => void;
};

const emit = defineEmits<{
  (event: "renderNeeded"): void;
}>();
const props = defineProps({
  ctx: {
    type: Object as PropType<JsonTreeCtx>,
    required: true,
  },
  parent: null,
  prop: {
    type: String,
    required: true,
  },
  data: null,
  path: {
    type: String,
    required: true,
  },
  initExpanded: {
    type: Boolean,
    default: false,
  },
  seq: Number,
});
const ctx = computed(() => props.ctx);
const selected = computed(() => {
  if (!ctx.value.selected) return false;
  return (
    ctx.value.selected.obj === props.parent &&
    ctx.value.selected.prop === props.prop
  );
});

const rerenderRef = ref(0);

const info = computed(() => {
  if (`${rerenderRef.value}` === "dummy")
    throw new Error("never reach here, only for ref tracking");
  if (`${props.seq}` === "dummy")
    throw new Error("never reach here, only for ref tracking");
  if (props.data === null) {
    return {
      type: "null",
      desc: "null",
    };
  }

  if (props.data === undefined) {
    return {
      type: "undefined",
      desc: "undefined",
    };
  }

  if (Array.isArray(props.data)) {
    return {
      type: "array",
      desc: `[${props.data.length}]`,
      children: props.data.map((v, idx) => ({ prop: `${idx}`, data: v })),
    };
  }
  if (typeof props.data === "object") {
    const info = {
      type: "object",
      desc: `{${Object.keys(props.data).length}}`,
      children: Object.entries(props.data).map(([k, v]) => ({
        prop: k,
        data: v,
      })),
      rerenderRef: ref(0),
    };
    if (props.ctx.filterProps) {
      info.children = info.children.filter((i) =>
        props.ctx.filterProps(props.data, i.prop)
      );
    }
    return info;
  }
  if (typeof props.data === "string") {
    return {
      type: "string",
      desc: props.data.slice(0, 20) + (props.data.length > 20 ? "..." : ""),
      title: props.data,
    };
  }
  if (typeof props.data === "number") {
    return {
      type: "number",
      desc: `${props.data}`,
    };
  }
  if (typeof props.data === "boolean") {
    return {
      type: "boolean",
      desc: `${props.data}`,
    };
  }
  return {
    type: "unknown",
    desc: JSON.stringify(props.data),
  };
});
const expand = ref(props.initExpanded);
const nodeInfo: NodeInfo = markRaw({
  path: props.path,
  obj: props.parent,
  prop: props.prop,
  rerender: () => {
    emit("renderNeeded");
  },
});
const clickSelect = () => {
  if (selected.value) {
    ctx.value.selected = undefined;
    return;
  }
  ctx.value.selected = nodeInfo;
};
const slots = {
    preDesc: 'pre-desc'
};
</script>
<template>
  <div class="json-tree">
    <p class="desc" @click="clickSelect" :class="{ selected }">
      <span
        class="expand text-btn"
        style="margin-right: 5px"
        :style="{ visibility: info.children ? 'visible' : 'hidden' }"
        @click="expand = !expand"
        >{{ expand ? "-" : "+" }}</span
      >
      <span class="name"> {{ props.prop }} </span>:
      <slot name="pre-desc" :node-info="nodeInfo"> </slot>
      <span :class="[`type-${info.type}`]" :title="info.desc">
        {{ info.desc }}
      </span>
    </p>
    <div v-if="info.children && expand">
      <div v-for="c in info.children" :key="c.prop">
        <JsonTree
          :data="c.data"
          :parent="props.data"
          :prop="c.prop"
          :ctx="props.ctx"
          :path="props.path + '/' + c.prop"
          @render-needed="rerenderRef++"
        >
          <template #[slots.preDesc]="{ nodeInfo }">
            <slot name="pre-desc" :node-info="nodeInfo as NodeInfo"> </slot>
          </template>
        </JsonTree>
      </div>
    </div>
  </div>
</template>
<style scoped>
.json-tree {
  padding-left: 15px;
  font-size: 12px;
  line-height: 16px;
}
.desc {
  margin: 1px 0;
}
.desc:hover {
  background-color: #f5f5f5;
}
.desc.selected {
  background-color: #ccc;
}
.expand {
  width: 12px;
}
.name {
  color: rgb(136, 18, 128);
  white-space: nowrap;
  font-weight: 700;
}
.type-boolean {
  color: rgb(26, 26, 166);
}
.type-string {
  color: rgb(200, 0, 0);
}
.type-number {
  color: rgb(28, 0, 207);
}
.type-null {
  color: rgb(136, 18, 128);
}
</style>
