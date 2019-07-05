import { IActorDelegate } from "./delegate";
import { IStage } from "./stage";

export class Actor<T> {
  constructor(
    private readonly stage: IStage<T>,
    private readonly delegate: IActorDelegate<T>,
  ) {}

  public async postMessage(item: T) {
    await this.stage.queue.push(this.delegate.name, item);
    console.log(`push`, item);
    await this.tryToProcessQueue();
    console.log(`out-of-post-message`);
  }

  public async tryToProcessQueue() {
    const { name, onAct, onError, rotate } = this.delegate;
    const startMillis = Date.now();
    const isAlive = () =>
      rotate ? Date.now() - startMillis < rotate.timeout : true;

    const { mutex, queue } = this.stage;
    while (true) {
      console.log(`try-to-lock`, name);
      if (!(await mutex.tryLock(name))) {
        console.log(`cannot-get-a-lock`);
        break;
      }
      console.log(`check-the-queue-size`, name);
      while (isAlive() && (await queue.size(name)) > 0) {
        const item = await queue.peek(name);
        console.log(`get-item-from-queue`, name, item);
        try {
          console.log(`act`, name, item);
          await maybeAwait(onAct(item));
        } catch (error) {
          console.log(`error`, name, item, error);
          if (onError) {
            await maybeAwait(onError(error));
          }
        }
        console.log(`delete-item-from-queue`, name);
        await queue.pop(name);
      }
      console.log(`release-a-lock`, name);
      await mutex.release(name);
      if ((await queue.size(name)) === 0) {
        console.log(`queue-is-empty`, name);
        break;
      }
      if (rotate && !isAlive()) {
        await maybeAwait(rotate.onNext(name));
        break;
      }
    }
  }
}

const maybeAwait = async (maybePromise: void | Promise<void>) => {
  if (maybePromise && maybePromise instanceof Promise) {
    await maybePromise;
  }
};
