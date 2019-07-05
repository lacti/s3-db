export interface ICodec<T, U> {
  encode(item: T): U;
  decode(value: U): T;
}

export class JsonCodec<T> implements ICodec<T, string> {
  private static readonly Undefined = "undefined";

  public encode(item: T) {
    if (item === undefined) {
      return JsonCodec.Undefined;
    }
    return JSON.stringify(item);
  }
  public decode(value: string) {
    if (value === undefined) {
      return undefined;
    }
    return JSON.parse(value) as T;
  }
}
