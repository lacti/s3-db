export interface IVersioned<T> {
  version: number;
  content: T;
}
