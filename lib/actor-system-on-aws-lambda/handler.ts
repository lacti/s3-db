import { APIGatewayProxyHandler, Handler } from "aws-lambda";
import { Actor } from "../actor-system";
import { IActorLambdaEvent } from "./event";

const defaultAPIProxyFunctionTimeoutMillis = 6 * 1000;
const defaultLambdaFunctionTimeoutMillis = 14 * 60 * 1000;

type IActorFactory = (actorName: string) => Actor<any>;

export const handleActorLambdaEvent = (
  actorFactory: IActorFactory,
  functionTimeout: number = defaultLambdaFunctionTimeoutMillis
): Handler<IActorLambdaEvent, void> => async event => {
  await actorFactory(event.actorName).tryToProcess({
    shiftTimeout: functionTimeout
  });
};

export const handleActorAPIEvent = (
  actorFactory: IActorFactory,
  functionTimeout: number = defaultAPIProxyFunctionTimeoutMillis
): APIGatewayProxyHandler => async event => {
  const actor = actorFactory(event.path);
  await actor.post(JSON.parse(event.body));
  await actor.tryToProcess({
    shiftTimeout: functionTimeout
  });
  return { statusCode: 200, body: "OK" };
};
