import { IRepository } from "..";
import { IVersioned } from "./versioned";

export type IValues<V> = V[];

export class ListDocument<V = string> {
  constructor(
    private readonly repository: IRepository,
    private readonly tupleKey: string
  ) {}

  public async insert(value: V) {
    return this.edit(values => [...values, value]);
  }

  public async deleteIf(filter: (input: V) => boolean) {
    return this.edit(values => values.filter(filter));
  }

  public async truncate() {
    return this.repository.delete(this.tupleKey);
  }

  public async read() {
    return this.repository.get<IVersioned<IValues<V>>>(this.tupleKey);
  }

  public async edit(modifier: (input: V[]) => V[]) {
    const doc = this.ensureDocument(await this.read());
    const newDoc = {
      content: modifier(doc.content),
      version: doc.version + 1
    };
    await this.repository.set(this.tupleKey, newDoc);
    return newDoc;
  }

  public async view<U>(selector: (input: V[]) => U) {
    return selector(this.ensureDocument(await this.read()).content);
  }

  private ensureDocument(doc: IVersioned<IValues<V>>): IVersioned<IValues<V>> {
    const version = doc && doc.version ? doc.version : 0;
    const content = doc && doc.content ? doc.content : [];
    return { version, content };
  }
}
