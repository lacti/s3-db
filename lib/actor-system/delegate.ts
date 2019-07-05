export interface IActorRotate {
  timeout: number;
  onNext: (actorName: string) => Promise<void> | void;
}

export interface IActorDelegate<T> {
  name: string;
  onAct: (item: T) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
  rotate?: IActorRotate;
}
