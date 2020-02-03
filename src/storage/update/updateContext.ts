import UpdateOperationBase from "../operation/updateOperationBase";
import ResourceValue from "../resource/resourceValue";

type UpdateOperationContext<R extends UpdateOperationBase> = Omit<
  R,
  "requestId" | "resourceId" | "operation"
> & { resource: ResourceValue | null };

export default UpdateOperationContext;
