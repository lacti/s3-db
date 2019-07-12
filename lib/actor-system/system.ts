import { Actor } from "./actor";
import { ILock } from "./lock";
import { IQueue } from "./queue";

interface IActorSystemArguments {
  queue: IQueue;
  lock: ILock;
}

export class ActorSystem {
  private readonly actors: { [name: string]: Actor<any> } = {};

  private readonly queue: IQueue;
  private readonly lock: ILock;

  constructor({ queue, lock }: IActorSystemArguments) {
    this.queue = queue;
    this.lock = lock;
  }

  public spawn<T>(actorName: string) {
    const actor = new Actor<T>(actorName, this.queue, this.lock);
    this.actors[actorName] = actor;
    return actor;
  }

  public find<T = any>(actorName: string): Actor<T> | null {
    const actor = this.actors[actorName];
    if (!actor) {
      return null;
    }
    return actor as Actor<T>;
  }
}
