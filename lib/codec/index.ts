export interface ICodec<B> {
  encode<T>(item: T): B;
  decode<T>(value: B): T;
}

export class JsonCodec implements ICodec<string> {
  private static readonly Undefined = "undefined";

  public encode<T>(item: T) {
    if (item === undefined) {
      return JsonCodec.Undefined;
    }
    return JSON.stringify(item);
  }
  public decode<T>(value: string) {
    if (value === undefined) {
      return undefined;
    }
    return JSON.parse(value) as T;
  }
}
