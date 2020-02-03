import AppendOperation from "../operation/appendOperation";
import pathDelimiter from "../path/pathDelimiter";
import ArrayValue from "../resource/arrayValue";
import ensureArrayValue from "../resource/ensureArrayValue";
import ensureKeyValue from "../resource/ensureKeyValue";
import KeyValue from "../resource/keyValue";
import ResourceValue from "../resource/resourceValue";
import UpdateOperationContext from "./updateContext";

export default function processAppendOperation({
  resource,
  path,
  value,
  upsert
}: UpdateOperationContext<AppendOperation>): ResourceValue {
  const initialValue = resolveInitialValue(value);
  const ensuredResource = ensureResource(
    resource,
    path.length > 0,
    initialValue
  );
  const target = resolveTarget(ensuredResource, path, initialValue);
  if (value instanceof Array) {
    const arrayTarget = ensureArrayValue(target);
    for (const each of value) {
      arrayTarget.push(each);
    }
  } else if (value instanceof Object) {
    const keyValueTarget = ensureKeyValue(target);
    for (const [k, v] of Object.entries(value)) {
      if (!upsert && k in keyValueTarget) {
        throw new Error(`Invalid addition: key[${k}] already exists`);
      }
      keyValueTarget[k] = v;
    }
  }
  return ensuredResource;
}

function resolveInitialValue(value: AppendOperation["value"]): ResourceValue {
  return value instanceof Array ? ([] as ArrayValue) : ({} as KeyValue);
}

function ensureResource(
  resource: ResourceValue | null,
  hasPath: boolean,
  initialValue: ResourceValue
) {
  if (resource !== null) {
    return resource;
  }
  return hasPath ? ({} as KeyValue) : initialValue;
}

function resolveTarget(
  ensuredResource: ResourceValue,
  path: string,
  initialValue: ResourceValue
): ResourceValue {
  let target: ResourceValue = ensuredResource;
  let currentPath = path;

  while (currentPath.length > 0) {
    const nextDot = currentPath.indexOf(pathDelimiter);
    const endOfPath = nextDot < 0;
    const currentKey = endOfPath
      ? currentPath
      : currentPath.substring(0, nextDot);
    const currentInitialValue = endOfPath ? initialValue : {};
    const parentOfTarget = ensureKeyValue(target);
    target = parentOfTarget[currentKey] =
      parentOfTarget[currentKey] ?? currentInitialValue;
    currentPath = currentPath.substring(
      currentKey.length + pathDelimiter.length
    );
  }
  return target;
}
