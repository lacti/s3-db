import * as http from "http";
import * as https from "https";
import { parse as parseURL } from "url";

export default function httpRequest(
  url: string,
  requestArgs: http.ClientRequestArgs,
  body?: unknown
) {
  return new Promise<http.IncomingMessage>((resolve, reject) => {
    const request =
      parseURL(url).protocol === "http:" ? http.request : https.request;
    const req = request(url, requestArgs, async res => {
      if (res.statusCode !== 200) {
        reject(new Error(`${res.statusCode} ${res.statusMessage}`));
      } else {
        resolve(res);
      }
    });
    if (body !== undefined) {
      req.write(JSON.stringify(body), "utf-8");
    }
    req.end();
  });
}
