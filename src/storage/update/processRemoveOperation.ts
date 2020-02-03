import RemoveOperation from "../operation/removeOperation";
import decomposePath from "../path/decomposePath";
import ensureKeyValue from "../resource/ensureKeyValue";
import readValue from "../resource/readValue";
import ResourceValue from "../resource/resourceValue";
import UpdateOperationContext from "./updateContext";

export default function processRemoveOperation({
  resource,
  path,
  key
}: UpdateOperationContext<RemoveOperation>): ResourceValue | null {
  if (resource === null) {
    return null;
  }
  if (key === undefined) {
    if (path.length === 0) {
      return null;
    } else {
      const { parentPath, currentKey } = decomposePath(path);
      const parent = readValue(resource, parentPath);
      if (parent !== undefined) {
        delete ensureKeyValue(parent)[currentKey];
      }
    }
  } else {
    if (path.length === 0) {
      const keyValueResource = ensureKeyValue(resource);
      key.forEach(eachKey => {
        delete keyValueResource[eachKey];
      });
    } else {
      const parent = readValue(resource, path);
      if (parent !== undefined) {
        const keyValueParent = ensureKeyValue(parent);
        key.forEach(eachKey => {
          delete keyValueParent[eachKey];
        });
      }
    }
  }
  return resource;
}
