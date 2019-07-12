export interface ILock {
  tryAcquire(actorName: string): Promise<boolean>;
  release(actorName: string): Promise<boolean>;
}
