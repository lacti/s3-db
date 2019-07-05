export interface IQueue<T> {
  size(actorName: string): Promise<number>;
  push(actorName: string, item: T): Promise<void>;
  pop(actorName: string): Promise<T>;
  peek(actorName: string): Promise<T>;
}
