import del from "./del";
import Env from "./env";
import get from "./get";
import put from "./put";

export default function s3cb(env: Env) {
  return { get: get(env), put: put(env), del: del(env) };
}
