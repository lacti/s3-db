import authorizationHeader from "./authorization";
import Env from "./env";
import httpRequest from "./httpRequest";

export default function put(env: Env) {
  return (key: string, body: unknown) =>
    httpRequest(
      env.apiUrl + key,
      {
        method: "PUT",
        headers: {
          ...authorizationHeader(env)
        }
      },
      body
    );
}
