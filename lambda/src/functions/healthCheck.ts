import { LambdaRequest, LambdaResponse } from '../types/contracts';

export const handler = async (event: LambdaRequest): Promise<LambdaResponse> => {
  console.log('Invoked by:', event.requestedBy);
  console.log('Action:', event.action);

  return {
    message: 'Ok',
    timestamp: new Date().toISOString(),
  };
};