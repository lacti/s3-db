import UpdateOperationBase from "../../storage/operation/updateOperationBase";

type StorageUserRequest<O extends UpdateOperationBase> = Omit<
  O,
  "transactionId" | "requestId"
> & {
  token: string;
};

export default StorageUserRequest;
