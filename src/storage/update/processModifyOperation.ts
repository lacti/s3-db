import ModifyOperation from "../operation/modifyOperation";
import ensureKeyValue from "../resource/ensureKeyValue";
import readValue from "../resource/readValue";
import ResourceValue from "../resource/resourceValue";
import UpdateOperationContext from "./updateContext";

export default function processModifyOperation({
  resource,
  path,
  value
}: UpdateOperationContext<ModifyOperation>): ResourceValue {
  if (resource === null) {
    throw new Error("Invalid modification: resource does not exist");
  }

  if (path.length === 0) {
    return value;
  }
  const parent = readValue(resource, path);
  if (parent === undefined) {
    throw new Error("Invalid path: no target to modify");
  }

  const keyValueParent = ensureKeyValue(parent);
  for (const [key, newValue] of Object.entries(value)) {
    keyValueParent[key] = newValue;
  }
  return resource;
}
