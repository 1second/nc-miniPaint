## nc 集成

### 笔记

#### vite/vitest 兼容 webpack 的 require.context
```js
var modules_context = require.context("./../../languages/", true, /\.json$/);
```

应该替换为 ==>

``` js
var ctx = import.meta.globEager("./../../languages/*.json");
var modules_context = (key) => ctx[key];
modules_context.keys = () => Object.keys(ctx);
```

找到一个 vite 插件可自动完成替换 `@originjs/vite-plugin-require-context`
