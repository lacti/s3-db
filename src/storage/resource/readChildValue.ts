import ensureKeyValue from "./ensureKeyValue";
import ResourceValue from "./resourceValue";

export default function readChildValue(
  parent: ResourceValue,
  childKey: string
): ResourceValue | undefined {
  const keyValueParent = ensureKeyValue(parent);
  if (!(childKey in keyValueParent)) {
    return undefined;
  }

  return keyValueParent[childKey];
}
