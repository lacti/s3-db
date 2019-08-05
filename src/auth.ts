import buildAuthorizer from "@yingyeothon/aws-lambda-jwt-custom-authorizer";
import { ConsoleLogger } from "@yingyeothon/logger";
import { APIGatewayProxyHandler, CustomAuthorizerHandler } from "aws-lambda";
import "source-map-support/register";
import envars from "./env";

export const handle: CustomAuthorizerHandler = buildAuthorizer({
  jwtSecret: envars.auth.jwtSecret,
  jwtExpiresIn: "5m",
  login: async ({ id, password }) =>
    id === envars.auth.id && password === envars.auth.password,
  logger: new ConsoleLogger("debug")
});

export const login: APIGatewayProxyHandler = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(event.requestContext.authorizer)
  };
};
