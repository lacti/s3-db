import { Lambda } from "aws-sdk";
import { IActorLambdaEvent } from "./event";

export const shiftToNextLambda = ({
  functionName,
  functionVersion
}: {
  functionName: string;
  functionVersion?: string;
}) => async (actorName: string) =>
  new Lambda()
    .invoke({
      FunctionName: functionName,
      InvocationType: "Event",
      Qualifier: functionVersion || "$LATEST",
      Payload: JSON.stringify({
        actorName
      } as IActorLambdaEvent)
    })
    .promise();
