import pathDelimiter from "../path/pathDelimiter";
import readChildValue from "./readChildValue";
import ResourceValue from "./resourceValue";

export default function readValue(
  value: ResourceValue,
  path: string
): ResourceValue | undefined {
  if (path.length === 0) {
    return value;
  }
  const nextDot = path.indexOf(pathDelimiter);
  if (nextDot < 0) {
    return readChildValue(value, path);
  }
  const currentKey = path.substring(0, nextDot);
  const nextPath = path.substring(nextDot + pathDelimiter.length);

  const maybeChild = readChildValue(value, currentKey);
  if (maybeChild === undefined) {
    return undefined;
  }
  return readValue(maybeChild, nextPath);
}
