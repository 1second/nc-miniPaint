import { Http } from "./http";

class Api {
  private http: Http;

  constructor(http: Http) {
    this.http = http;
  }

  async getTemplate(filename: string) {
    return await this.http.get<any>("/api/console/v1/template", {
      params: { filename },
    });
  }

  async saveTemplate(filename: string, data: any) {
    return await this.http.put<any>("/api/console/v1/template", {
      data: { filename, data },
    });
  }

  async renderTemplate(filename: string, varMap: any) {
    return await this.http.post<string>("/api/console/v1/template/render", {
      data: { filename, varMap },
    });
  }
}

let apiBase = "http://img-render-api.fc.krzb.net";
if (["127.0.0.1", "localhost"].includes(location.hostname)) {
  apiBase = "http://127.0.0.1:9000";
}


export const api = new Api(new Http(apiBase));
