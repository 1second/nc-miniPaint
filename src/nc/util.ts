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
