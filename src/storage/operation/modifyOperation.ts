import KeyValue from "../resource/keyValue";
import UpdateOperationBase from "./updateOperationBase";

export default interface ModifyOperation extends UpdateOperationBase {
  operation: "modify";
  value: KeyValue;
}
