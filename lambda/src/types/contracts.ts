export interface LambdaRequest {
  action: string;
  requestedBy: string;
}

export interface LambdaResponse {
  message: string;
  timestamp: string;
}