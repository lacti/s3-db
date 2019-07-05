import { IRepository } from ".";

export interface IVersioned<T> {
  version: number;
  content: T;
}

export interface IKeyValues<V> {
  [key: string]: V;
}

export class SimpleKV<V = string> {
  private static readonly DatabaseKey = "db";

  constructor(
    private readonly repository: IRepository<IVersioned<IKeyValues<V>>>,
  ) {}

  public async insertOrUpdate(key: string, value: V) {
    const doc: IVersioned<IKeyValues<V>> = this.ensureDocument(
      await this.repository.get(SimpleKV.DatabaseKey),
    );

    if (value === undefined) {
      delete doc.content[key];
    } else {
      doc.content[key] = value;
    }
    doc.version++;

    await this.repository.set(SimpleKV.DatabaseKey, doc);
    return doc.version;
  }

  public async delete(key: string) {
    return this.insertOrUpdate(key, undefined);
  }

  public async truncate() {
    return this.repository.delete(SimpleKV.DatabaseKey);
  }

  public async read() {
    return this.repository.get(SimpleKV.DatabaseKey);
  }

  private ensureDocument(
    doc: IVersioned<IKeyValues<V>>,
  ): IVersioned<IKeyValues<V>> {
    const version = doc && doc.version ? doc.version : 0;
    const content = doc && doc.content ? doc.content : {};
    return { version, content };
  }
}
