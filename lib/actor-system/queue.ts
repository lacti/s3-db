export interface IQueue {
  size(actorName: string): Promise<number>;
  push<T>(actorName: string, item: T): Promise<void>;
  pop<T>(actorName: string): Promise<T>;
  peek<T>(actorName: string): Promise<T>;
}
