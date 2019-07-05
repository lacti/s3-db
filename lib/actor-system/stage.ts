import { IMutex } from "./mutex";
import { IQueue } from "./queue";

export interface IStage<T> {
  mutex: IMutex;
  queue: IQueue<T>;
}
