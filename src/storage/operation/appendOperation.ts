import ArrayValue from "../resource/arrayValue";
import KeyValue from "../resource/keyValue";
import UpdateOperationBase from "./updateOperationBase";

export default interface AppendOperation extends UpdateOperationBase {
  operation: "append";
  value: KeyValue | ArrayValue;
  upsert: boolean;
}
