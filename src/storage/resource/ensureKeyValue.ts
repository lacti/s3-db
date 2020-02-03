import KeyValue from "./keyValue";
import ResourceValue from "./resourceValue";

export default function ensureKeyValue(value: ResourceValue): KeyValue {
  if (value instanceof Array) {
    throw new Error("Invalid structure: value is an array");
  }
  if (!(value instanceof Object)) {
    throw new Error("Invalid structure: value is not an object");
  }
  return value;
}
