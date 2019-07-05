export interface IMutex {
  tryLock(actorName: string): Promise<boolean>;
  release(actorName: string): Promise<boolean>;
}
