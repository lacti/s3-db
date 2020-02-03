import Env from "./env";

export default function authorizationHeader(env: Env) {
  if (env.apiId !== undefined && env.apiPassword !== undefined) {
    const authorization = Buffer.from(
      `${env.apiId}:${env.apiPassword}`,
      "utf-8"
    ).toString("base64");
    return {
      Authorization: `Basic ${authorization}`
    };
  }
  return {};
}
