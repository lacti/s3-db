import ArrayValue from "./arrayValue";
import ResourceValue from "./resourceValue";

export default function ensureArrayValue(value: ResourceValue): ArrayValue {
  if (value instanceof Array) {
    return value;
  }
  throw new Error("Invalid structure: value is not an array");
}
