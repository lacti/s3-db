import { ListDocument, MapDocument } from "./document";

export interface IRepository {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

export abstract class SimpleRepository {
  public abstract get<T>(key: string): Promise<T | undefined>;
  public abstract set<T>(key: string, value: T): Promise<void>;
  public abstract delete(key: string): Promise<void>;

  public getListDocument<V>(key: string) {
    return new ListDocument<V>(this, key);
  }

  public getMapDocument<V>(key: string) {
    return new MapDocument<V>(this, key);
  }
}
