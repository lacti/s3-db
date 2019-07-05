import { Actor } from "./actor";
import { IActorDelegate } from "./delegate";
import { IStage } from "./stage";

export type Director<T> = (actor: IActorDelegate<T>) => Actor<T>;

export const setupStage = <T>(stage: IStage<T>): Director<T> => (
  actorDelegate: IActorDelegate<T>,
) => new Actor<T>(stage, actorDelegate);
