import { S3 } from "aws-sdk";
import { ICodec, JsonCodec } from "../codec";
import { SimpleRepository } from "../repository";

interface IS3RepositoryArguments {
  bucketName: string;
  s3?: S3;
  prefix?: string;
  codec?: ICodec<string>;
}

export class S3Repository extends SimpleRepository {
  private readonly bucketName: string;
  private readonly s3: S3;
  private readonly prefix: string;
  private readonly codec: ICodec<string>;

  constructor({ bucketName, s3, prefix, codec }: IS3RepositoryArguments) {
    super();
    this.bucketName = bucketName;
    this.s3 = s3 || new S3();
    this.prefix = prefix;
    this.codec = codec || new JsonCodec();
  }

  public async get<T>(key: string) {
    try {
      const content = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: this.asS3Key(key)
        })
        .promise();

      return this.codec.decode<T>(content.Body.toString("utf-8"));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async set<T>(key: string, value: T) {
    if (value === undefined) {
      return this.delete(key);
    }
    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: this.asS3Key(key),
        Body: this.codec.encode(value)
      })
      .promise();
  }

  public async delete(key: string) {
    await this.s3
      .deleteObject({
        Bucket: this.bucketName,
        Key: this.asS3Key(key)
      })
      .promise();
  }

  public async withPrefix(prefix: string) {
    return new S3Repository({
      bucketName: this.bucketName,
      s3: this.s3,
      prefix,
      codec: this.codec
    });
  }

  private asS3Key(key: string) {
    return this.prefix ? `${this.prefix}${key}` : key;
  }
}
