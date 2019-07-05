// tslint:disable-next-line:interface-name
export interface RecurrentLambdaEvent {
  recurrent: true;
  path: string;
}

export const isRecurrentLambdaEvent = (event: any) => event.recurrent;
