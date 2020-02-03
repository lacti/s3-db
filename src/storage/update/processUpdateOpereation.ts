import { ConsoleLogger } from "@yingyeothon/logger";
import fastCopy from "fast-copy";
import AppendOperation from "../operation/appendOperation";
import ModifyOperation from "../operation/modifyOperation";
import RemoveOperation from "../operation/removeOperation";
import s3cb from "../persistence/s3cb";
import ResourceValue from "../resource/resourceValue";
import processAppendOperation from "./processAppendOperation";
import processModifyOperation from "./processModifyOperation";
import processRemoveOperation from "./processRemoveOperation";

/**
 * 1. transaction에 필요한 자원을 모두 fetch
 * 2. 각 op에 대한 반복을 하면서 model 갱신
 * 3-0. 만약 op가 1개라면 다르게 취급해야 할까?
 * 3-1. 에러가 발생하지 않았다면 갱신된 model을 memory에 commit
 * 3-2. 에러가 발생했다면 갱신된 model을 모두 제거
 * 4. 모든 op loop가 완료되면 s3에 반영
 */
// 여기에 진입했을 때에는 object가 deep copy가 되었다는 가정 하에
// 그냥 바로 수정해도 된다고 가정하자.
// 하지만 성능을 위해 한 건을 요청했을 때에는 굳이 copy를 하지 않고 처리할 수도 있다.
// 이 부분은 transaction을 어떻게 관리할 것이냐를 통해 정리하자.
//   -> transaction을 사용해야 하는 경우는 working copy를 만들고
//   -> 아닌 경우는 바로 auto commit으로 취급한다.

type AnyOperation = AppendOperation | ModifyOperation | RemoveOperation;
const logger = new ConsoleLogger("debug");

export default async function processUpdateOperation(allOps: AnyOperation[][]) {
  const resources = resourceCache();
  const succeeds: { resourceId: string; requestId: string }[] = [];
  for (const ops of allOps) {
    const [firstOp] = ops;
    const resource = await resources.get(firstOp.resourceId);
    const [success, newResource] = applyOperations(ops, resource);
    if (!success) {
      continue;
    }

    resources.update(firstOp.resourceId, newResource);
    succeeds.push(firstOp);
  }

  await Promise.all(
    succeeds
      .map(({ resourceId }) => ({
        resourceId,
        resource: resources.peek(resourceId)
      }))
      .map(({ resourceId, resource }) =>
        resource === null ? p.del(resourceId) : p.put(resourceId, resource)
      )
  );
  return succeeds.map(({ requestId }) => requestId);
}

function resourceCache() {
  const cache: { [resourceId: string]: ResourceValue | null } = {};
  return {
    get: async (resourceId: string) => {
      if (!(resourceId in cache)) {
        cache[resourceId] = await getResource(resourceId);
      }
      return cache[resourceId];
    },
    update: (resourceId: string, resource: ResourceValue | null) =>
      (cache[resourceId] = resource),
    peek: (resourceId: string) => cache[resourceId]
  };
}

function applyOperations(
  ops: AnyOperation[],
  originalResource: ResourceValue | null
): [boolean, ResourceValue | null] {
  let resource =
    ops.length === 1 ? originalResource : fastCopy(originalResource);
  try {
    for (const op of ops) {
      resource = dispatchOperation(op, resource);
    }
    return [true, resource];
  } catch (error) {
    logger.error("Cannot apply ops", ops, error);
  }
  return [false, null];
}

function dispatchOperation(op: AnyOperation, resource: ResourceValue | null) {
  switch (op.operation) {
    case "append":
      return processAppendOperation({ ...op, resource });
    case "modify":
      return processModifyOperation({ ...op, resource });
    case "remove":
      return processRemoveOperation({ ...op, resource });
    default:
      throw new Error("Unsupported operation");
  }
}

const p = s3cb({
  apiUrl: process.env.S3CB_API_URL!,
  apiId: process.env.S3CB_API_ID,
  apiPassword: process.env.S3CB_API_PASSWORD
});

async function getResource(resourceId: string): Promise<ResourceValue | null> {
  try {
    const resource = await p.get(resourceId);
    if (resource.length === 0) {
      return null;
    }
    return JSON.parse(resource) as ResourceValue;
  } catch (error) {
    if (/404/.test(error.message)) {
      return null;
    }
    throw error;
  }
}
