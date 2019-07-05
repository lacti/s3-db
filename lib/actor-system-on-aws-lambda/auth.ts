import { APIGatewayProxyEvent } from "aws-lambda";
import { isRecurrentLambdaEvent } from "./event";
import { AWSLambdaActorHandler } from "./handler";

export const withAuth = (
  options: {
    httpHeaderKeyForSecretKey: string;
    secretKey: string;
  } = {
    httpHeaderKeyForSecretKey: "X-Auth",
    secretKey: process.env.SECRET,
  },
) => (handler: AWSLambdaActorHandler): AWSLambdaActorHandler => (
  event,
  context,
  callback,
) => {
  if (
    isRecurrentLambdaEvent(event) ||
    (event as APIGatewayProxyEvent).headers[
      options.httpHeaderKeyForSecretKey
    ] !== options.secretKey
  ) {
    callback(null, {
      statusCode: 400,
      body: "NO",
    });
  } else {
    return handler(event, context, callback);
  }
};
