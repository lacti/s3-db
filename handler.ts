import {
  APIGatewayProxyHandler,
  Handler,
  Context,
  APIGatewayProxyEvent,
  Callback,
  APIGatewayProxyResult
} from "aws-lambda";
import { Lambda, S3 } from "aws-sdk";
import * as IORedis from "ioredis";
import "source-map-support/register";

interface IMutex {
  tryLock(actorName: string): Promise<boolean>;
  release(actorName: string): Promise<boolean>;
}

const asRedisKey = (prefix: string) => (name: string) => `${prefix}:${name}`;

interface IQueue<T> {
  size(actorName: string): Promise<number>;
  push(actorName: string, item: T): Promise<void>;
  pop(actorName: string): Promise<T>;
  peek(actorName: string): Promise<T>;
}

interface ICodec<T, U> {
  encode(item: T): U;
  decode(value: U): T;
}

class JsonCodec<T> implements ICodec<T, string> {
  static readonly Undefined = "undefined";
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

interface IStage<T> {
  mutex: IMutex;
  queue: IQueue<T>;
}

interface IActorDelegate<T> {
  name: string;
  onAct: (item: T) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
  rotate?: IActorRotate;
}

interface IActorRotate {
  timeout: number;
  onNext: (actorName: string) => Promise<void> | void;
}

const maybeAwait = async (maybePromise: void | Promise<void>) => {
  if (maybePromise && maybePromise instanceof Promise) {
    await maybePromise;
  }
};

type Director<T> = (actor: IActorDelegate<T>) => Actor<T>;

class Actor<T> {
  constructor(
    private readonly stage: IStage<T>,
    private readonly delegate: IActorDelegate<T>
  ) {}

  public async postMessage(item: T) {
    await this.stage.queue.push(this.delegate.name, item);
    await this.tryToProcessQueue();
  }

  public async tryToProcessQueue() {
    const { name: name, onAct, onError, rotate } = this.delegate;
    const startMillis = Date.now();
    const isAlive = () =>
      rotate ? Date.now() - startMillis < rotate.timeout : true;

    const { mutex, queue } = this.stage;
    while (true) {
      if (!(await mutex.tryLock(name))) {
        break;
      }
      while ((await queue.size(name)) > 0) {
        const item = await queue.peek(name);
        try {
          await maybeAwait(onAct(item));
        } catch (error) {
          if (onError) {
            await maybeAwait(onError(error));
          }
        }
        await queue.pop(name);
      }
      await mutex.release(name);
      if ((await queue.size(name)) === 0) {
        break;
      }
      if (rotate && !isAlive()) {
        await maybeAwait(rotate.onNext(name));
        break;
      }
    }
  }
}

const setupStage = <T>(stage: IStage<T>): Director<T> => (
  actorDelegate: IActorDelegate<T>
) => new Actor<T>(stage, actorDelegate);

class RedisMutex implements IMutex {
  static readonly Locked = "1";
  static readonly Unlocked = "0";

  private readonly asRedisName = asRedisKey("mutex");

  constructor(private readonly redis: IORedis.Redis) {}

  public async tryLock(actorName: string) {
    return this.swapAndCompare(
      actorName,
      RedisMutex.Locked,
      RedisMutex.Unlocked
    );
  }

  public async release(actorName: string) {
    return this.swapAndCompare(
      actorName,
      RedisMutex.Unlocked,
      RedisMutex.Locked
    );
  }

  private async swapAndCompare(
    actorName: string,
    nextState: string,
    expectedOld: string
  ) {
    const oldValue = await this.redis.getset(
      this.asRedisName(actorName),
      nextState
    );
    return oldValue === expectedOld;
  }
}

class RedisQueue<T> implements IQueue<T> {
  private readonly asRedisName = asRedisKey("queue");

  constructor(
    private readonly redis: IORedis.Redis,
    private readonly codec: ICodec<T, string> = new JsonCodec<T>()
  ) {}

  public size(actorName: string) {
    return this.redis.llen(this.asRedisName(actorName));
  }

  public push(actorName: string, item: T) {
    return this.redis.rpush(
      this.asRedisName(actorName),
      this.codec.encode(item)
    );
  }

  public async pop(actorName: string) {
    const value = await this.redis.lpop(this.asRedisName(actorName));
    return this.codec.decode(value);
  }

  public async peek(actorName: string) {
    const value = await this.redis.lindex(this.asRedisName(actorName), 0);
    return this.codec.decode(value);
  }
}

const setupStageWithRedis = <T>(
  redis: IORedis.Redis = new IORedis()
): Director<T> =>
  setupStage<T>({
    mutex: new RedisMutex(redis),
    queue: new RedisQueue(redis)
  });

interface RecurrentLambdaEvent {
  recurrent: true;
  path: string;
}

const isRecurrentLambdaEvent = (event: any) => event.recurrent;

type AWSLambdaActorHandler = Handler<
  APIGatewayProxyEvent | RecurrentLambdaEvent,
  APIGatewayProxyResult | void
>;

const lambdaRotation = (
  functionName: string,
  functionVersion: string
): IActorRotate => ({
  timeout: 840, // 14 mins
  onNext: async (actorName: string) => {
    const lambda = new Lambda();
    const invoked = await lambda
      .invoke({
        FunctionName: functionName,
        InvocationType: "Event",
        Qualifier: functionVersion,
        Payload: JSON.stringify({
          recurrent: true,
          path: actorName
        } as RecurrentLambdaEvent)
      })
      .promise();
    console.log(invoked);
  }
});

const actorOnAWSLambda = <T>(director: Director<T>) => (
  onAct: IActorDelegate<T>["onAct"],
  onError: IActorDelegate<T>["onError"] = console.error
): AWSLambdaActorHandler => async (event, context) => {
  const actor = await director({
    name: event.path,
    onAct,
    onError,
    rotate: lambdaRotation(context.functionName, context.functionVersion)
  });
  if (isRecurrentLambdaEvent(event)) {
    await actor.tryToProcessQueue();
  } else {
    await actor.postMessage(JSON.parse((event as APIGatewayProxyEvent).body));
    return {
      statusCode: 200,
      body: "OK"
    };
  }
};

const withAuth = () => (
  handler: AWSLambdaActorHandler
): AWSLambdaActorHandler => (event, context, callback) => {
  if (
    isRecurrentLambdaEvent(event) ||
    (event as APIGatewayProxyEvent).headers["X-Auth"] !== process.env.SECRET
  ) {
    callback(null, {
      statusCode: 400,
      body: "NO"
    });
  } else {
    return handler(event, context, callback);
  }
};

interface IRepository<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

class S3Repository<T> implements IRepository<T> {
  constructor(
    private readonly bucketName: string,
    private readonly s3 = new S3(),
    private readonly codec = new JsonCodec<T>()
  ) {}

  public async get(key: string) {
    try {
      const content = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: key
        })
        .promise();

      return this.codec.decode(content.Body.toString("utf-8"));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async set(key: string, value: T) {
    if (value === undefined || value === null) {
      return this.delete(key);
    }
    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: this.codec.encode(value)
      })
      .promise();
  }

  public async delete(key: string) {
    await this.s3
      .deleteObject({
        Bucket: this.bucketName,
        Key: key
      })
      .promise();
  }
}

interface IVersioned<T> {
  version: number;
  content: T;
}

interface KeyValue {
  key: string;
  value: any;
}

interface KeyValues {
  [key: string]: any;
}

type Document = IVersioned<KeyValues>;

const repo = new S3Repository<Document>(process.env.BUCKET_NAME!);

interface SetMessage {
  action: "set";
  payload: KeyValue;
}
interface DeleteMessage {
  action: "delete";
}
type Message = SetMessage | DeleteMessage;

const onMessage = actorOnAWSLambda(setupStageWithRedis<Message>());
const repoKey = "something";

export const db = withAuth()(
  onMessage(async item => {
    switch (item.action) {
      case "set":
        const doc = await repo.get(repoKey);
        ++doc.version;
        doc.content[item.payload.key] = item.payload.value;
        await repo.set(repoKey, doc);
        break;
      case "delete":
        await repo.delete(repoKey);
        break;
    }
  })
);
