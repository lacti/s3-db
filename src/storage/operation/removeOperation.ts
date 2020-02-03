import UpdateOperationBase from "./updateOperationBase";

type CurrentKey = undefined;
type MultipleSubKeys = string[];

export default interface RemoveOperation extends UpdateOperationBase {
  operation: "remove";
  key: CurrentKey | MultipleSubKeys;
}
