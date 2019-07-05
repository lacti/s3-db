import { S3 } from "aws-sdk";
import { ICodec, JsonCodec } from "../codec";
import { IRepository } from "../repository";

export class S3Repository<T> implements IRepository<T> {
  constructor(
    private readonly bucketName: string,
    private readonly s3 = new S3(),
    private readonly codec: ICodec<T, string> = new JsonCodec<T>(),
  ) {}

  public async get(key: string) {
    try {
      const content = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();

      return this.codec.decode(content.Body.toString("utf-8"));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async set(key: string, value: T) {
    if (value === undefined) {
      return this.delete(key);
    }
    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: this.codec.encode(value),
      })
      .promise();
  }

  public async delete(key: string) {
    await this.s3
      .deleteObject({
        Bucket: this.bucketName,
        Key: key,
      })
      .promise();
  }
}
