import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { Lambda } from "aws-sdk";
import { Director, IActorDelegate, IActorRotate } from "../actor-system";
import { isRecurrentLambdaEvent, RecurrentLambdaEvent } from "./event";

export type AWSLambdaActorHandler = Handler<
  APIGatewayProxyEvent | RecurrentLambdaEvent,
  APIGatewayProxyResult | void
>;

const invokeNextLambda = ({
  functionName,
  functionVersion,
}: {
  functionName: string;
  functionVersion: string;
}) => async (actorName: string) => {
  const lambda = new Lambda();
  const invoked = await lambda
    .invoke({
      FunctionName: functionName,
      InvocationType: "Event",
      Qualifier: functionVersion,
      Payload: JSON.stringify({
        recurrent: true,
        path: actorName,
      } as RecurrentLambdaEvent),
    })
    .promise();
  console.log(invoked);
};

export const rotateForAPIGatewayLambda = (context: {
  functionName: string;
  functionVersion: string;
}): IActorRotate => ({
  timeout: 3 * 1000,
  onNext: invokeNextLambda(context),
});

export const rotateForRecurrentLambda = (context: {
  functionName: string;
  functionVersion: string;
}): IActorRotate => ({
  timeout: 14 * 60 * 1000,
  onNext: invokeNextLambda(context),
});

export const actorOnAWSLambda = <T>(director: Director<T>) => (
  onAct: IActorDelegate<T>["onAct"],
  onError: IActorDelegate<T>["onError"] = console.error,
): AWSLambdaActorHandler => async (event, context) => {
  const inRecurrentLambda = isRecurrentLambdaEvent(event);
  const actor = await director({
    name: event.path,
    onAct,
    onError,
    rotate: inRecurrentLambda
      ? rotateForRecurrentLambda(context)
      : rotateForAPIGatewayLambda(context),
  });
  if (inRecurrentLambda) {
    await actor.tryToProcessQueue();
  } else {
    await actor.postMessage(JSON.parse((event as APIGatewayProxyEvent).body));
    return {
      statusCode: 200,
      body: "OK",
    };
  }
};
