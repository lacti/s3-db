import authorizationHeader from "./authorization";
import Env from "./env";
import httpRequest from "./httpRequest";

export default function del(env: Env) {
  return (key: string) =>
    httpRequest(env.apiUrl + key, {
      method: "DELETE",
      headers: {
        ...authorizationHeader(env)
      }
    });
}
