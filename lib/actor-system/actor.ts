import { EventBroker } from "../event";
import { ILock } from "./lock";
import { IQueue } from "./queue";

interface IActorEventMap<T> {
  act: T;
  error: Error;
  shift: /* name */ string;
}

interface IActorProcessOptions {
  shiftTimeout?: number;
}

export class Actor<T> extends EventBroker<IActorEventMap<T>> {
  constructor(
    public readonly name: string,
    private readonly queue: IQueue,
    private readonly lock: ILock
  ) {
    super();
  }

  public async post(item: T) {
    await this.queue.push(this.name, item);
    console.log(`push`, item);
  }

  public async tryToProcess({ shiftTimeout }: IActorProcessOptions = {}) {
    const startMillis = Date.now();
    const isAlive = () =>
      shiftTimeout > 0 ? Date.now() - startMillis < shiftTimeout : true;

    const { name, queue, lock } = this;
    while (true) {
      console.log(`try-to-lock`, name);
      if (!(await lock.tryAcquire(name))) {
        console.log(`cannot-get-a-lock`);
        break;
      }
      console.log(`check-the-queue-size`, name);
      while (isAlive() && (await queue.size(name)) > 0) {
        const item = await queue.peek<T>(name);
        console.log(`get-item-from-queue`, name, item);
        try {
          console.log(`act`, name, item);
          await maybeAwait(this.fire("act", item));
        } catch (error) {
          console.log(`error`, name, item, error);
          await maybeAwait(this.fire("error", error));
        }
        console.log(`delete-item-from-queue`, name);
        await queue.pop(name);
      }
      console.log(`release-a-lock`, name);
      await lock.release(name);
      if ((await queue.size(name)) === 0) {
        console.log(`queue-is-empty`, name);
        break;
      }
      if (!isAlive()) {
        await maybeAwait(this.fire("shift", name));
        break;
      }
    }
  }
}

const maybeAwait = async (maybePromise: any | Promise<any>) => {
  if (maybePromise && maybePromise instanceof Promise) {
    await maybePromise;
  }
};
