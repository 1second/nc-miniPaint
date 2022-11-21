import { Ref } from "vue";
import "./nc.css";

export function getLocationQuery() {
  const query: Record<string, string> = {};
  const search = window.location.search;
  if (search) {
    const searchArr = search.slice(1).split("&");
    searchArr.forEach((item) => {
      const [key, value] = item.split("=");
      query[key] = decodeURIComponent(value);
    });
  }
  return query;
}

// wrap async function to set loading status
export function wrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  loading: Ref<boolean>,
  error?: Ref<string | null>
): T {
  return ((...args: any[]) => {
    loading.value = true;
    return fn(...args)
      .then((res) => {
        error && (error.value = null);
        return res;
      })
      .catch((e) => {
        error && (error.value = e.toString());
        throw e;
      })
      .finally(() => {
        loading.value = false;
      });
  }) as any;
}

export function deepCopy<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(deepCopy) as any;
  }
  if (typeof obj === "object") {
    if (obj instanceof HTMLElement) return obj;
    const res: Record<string, any> = {};
    for (const key in obj) {
      res[key] = deepCopy(obj[key]);
    }
    return res as any;
  }
  return obj;
}

export async function loadImage(src: string, needBase64 = true) {
  return new Promise<{ img: HTMLImageElement; dataUrl: string }>(
    (resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!needBase64) {
          resolve({ img, dataUrl: "" });
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL();
        resolve({ img, dataUrl });
      };
      img.onerror = (e) => {
        console.log(e, src);
        reject("图片加载失败");
      };
      img.src = src;
    }
  );
}

export async function initTplVarImgElement(tplVars: MiniPaint.TplVar[]) {
  for (const v of tplVars) {
    if (v.type === "image") {
      const { img } = await loadImage(v.data, false).catch((e) => {
        throw new Error("载入图片失败：" + v.data);
      });
      v.value = img;
    }
  }
}
