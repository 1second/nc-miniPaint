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
