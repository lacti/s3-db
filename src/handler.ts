import {
  handleActorAPIEvent,
  handleActorLambdaEvent
} from "@yingyeothon/actor-system-aws-lambda-support";
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { getDatabaseActorFromActorName, readDataFromUrlPath } from "./actor";

export const topHalf: APIGatewayProxyHandler = handleActorAPIEvent({
  spawn: (_: string, event: APIGatewayProxyEvent) =>
    getDatabaseActorFromActorName(event.pathParameters.name),
  functionTimeout: 5 * 1000
});

export const get: APIGatewayProxyHandler = async event => {
  const data = await readDataFromUrlPath(event.pathParameters.name);
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};

export const bottomHalf = handleActorLambdaEvent({
  spawn: getDatabaseActorFromActorName,
  functionTimeout: (900 - 3) * 1000
});
