import getStream from "get-stream";
import authorizationHeader from "./authorization";
import Env from "./env";
import httpRequest from "./httpRequest";

export default function get(env: Env) {
  return (key: string) =>
    httpRequest(env.apiUrl + key, {
      method: "GET",
      headers: {
        ...authorizationHeader(env)
      }
    }).then(res => getStream(res.setEncoding("utf-8")));
}
