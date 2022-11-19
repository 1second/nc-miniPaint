export class Http {
  readonly base: string;
  constructor(base: string) {
    this.base = base;
  }

  async get<T = any>(
    url: string,
    opt: {
      data?: any;
      params?: Record<string, string>;
    } & RequestInit = {}
  ): Promise<T> {
    return this.request("GET", url, opt);
  }

  async post<T = any>(
    url: string,
    opt: {
      data?: any;
      params?: Record<string, string>;
    } & RequestInit = {}
  ): Promise<T> {
    return this.request("POST", url, opt);
  }

  async put<T = any>(
    url: string,
    opt: RequestInit & {
      data?: any;
      params?: Record<string, string>;
    } = {}
  ): Promise<T> {
    return this.request("PUT", url, opt);
  }

  async request<T = any>(
    method: string,
    url: string,
    opt: {
      data?: any;
      params?: Record<string, string>;
    } & RequestInit = {}
  ): Promise<T> {
    if (opt.params) {
      url += "?" + new URLSearchParams(opt.params).toString();
    }
    const fetchOpt: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    };
    Object.assign(fetchOpt, opt);
    if (opt.data) {
      fetchOpt.body = JSON.stringify(opt.data);
    }
    const resp = await fetch(this.base + url, fetchOpt);
    // if (resp.status !== 200) {
    // throw new Error(resp.statusText);
    // }
    const data = await resp.json();
    if (data.code !== 0) {
      throw new Error(data.message);
    }
    return data.data;
  }
}

export function initAbortController() {
  let ac: AbortController | null = null;
  return {
    abort() {
      if (!ac) return;
      ac.abort();
      ac = null;
    },
    signal() {
      if (!ac) {
        ac = new AbortController();
      }
      return ac.signal;
    },
  };
}


