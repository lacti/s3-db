import UpdateOperationBase from "../../storage/operation/updateOperationBase";
import StorageUserRequest from "./storageUserRequest";

export default function validateStorageUserRequest<
  O extends UpdateOperationBase,
  R extends StorageUserRequest<O>
>({ resourceId, path, token }: Partial<R>) {
  if (token === undefined || token.length === 0) {
    throw new Error("Invalid token");
  }
  if (resourceId === undefined || resourceId.length === 0) {
    throw new Error("Invalid resourceId");
  }
  if (path === undefined || path.length === 0) {
    throw new Error("Invalid path");
  }
}
