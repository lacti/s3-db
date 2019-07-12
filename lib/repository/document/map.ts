import { IRepository } from "..";
import { IVersioned } from "./versioned";

interface IKeyValues<V> {
  [key: string]: V;
}

export class MapDocument<V = string> {
  constructor(
    private readonly repository: IRepository,
    private readonly tupleKey: string
  ) {}

  public async insertOrUpdate(key: string, value: V) {
    return this.edit(values => ({ ...values, [key]: value }));
  }

  public async delete(key: string) {
    return this.insertOrUpdate(key, undefined);
  }

  public async truncate() {
    return this.repository.delete(this.tupleKey);
  }

  public async read() {
    return this.repository.get<IVersioned<IKeyValues<V>>>(this.tupleKey);
  }

  public async edit(modifier: (input: IKeyValues<V>) => IKeyValues<V>) {
    const doc = this.ensureDocument(await this.read());
    const newDoc = {
      content: modifier(doc.content),
      version: doc.version + 1
    };
    await this.repository.set(this.tupleKey, newDoc);
    return newDoc;
  }

  public async view<U>(selector: (input: IKeyValues<V>) => U) {
    return selector(this.ensureDocument(await this.read()).content);
  }

  private ensureDocument(
    doc: IVersioned<IKeyValues<V>>
  ): IVersioned<IKeyValues<V>> {
    const version = doc && doc.version ? doc.version : 0;
    const content = doc && doc.content ? doc.content : {};
    return { version, content };
  }
}
