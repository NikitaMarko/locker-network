import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
 
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
 
const LOCKER_CACHE_TABLE = process.env.LOCKER_CACHE_TABLE || 'locker-locker-cache';
const OPERATIONS_TABLE = process.env.OPERATIONS_TABLE || 'locker-dev-operations-dynamodb';
 
// ─── Operations table ───
 
export const updateOperationStatus = async (
  operationId: string,
  status: string,
  errorMessage?: string,
) => {
  await docClient.send(new UpdateCommand({
    TableName: OPERATIONS_TABLE,
    Key: { operationId },
    UpdateExpression: errorMessage
      ? 'SET #s = :status, errorMessage = :err'
      : 'SET #s = :status',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: {
      ':status': status,
      ...(errorMessage && { ':err': errorMessage }),
    },
  }));
};
 
// ─── Locker cache ───
 
export const upsertLockerCache = async (
  lockerBoxId: string,
  payload: Record<string, unknown>,
  version: number,
) => {
  const existing = await docClient.send(new GetCommand({
    TableName: LOCKER_CACHE_TABLE,
    Key: { lockerBoxId },
  }));
 
  if (existing.Item && (existing.Item.version as number) >= version) {
    console.log(JSON.stringify({
      action: 'SKIP_STALE_UPDATE',
      lockerBoxId,
      existingVersion: existing.Item.version,
      incomingVersion: version,
    }));
    return;
  }
 
  await docClient.send(new PutCommand({
    TableName: LOCKER_CACHE_TABLE,
    Item: { ...payload, lockerBoxId },
  }));
};
 
export const deleteLockerCache = async (lockerBoxId: string) => {
  await docClient.send(new DeleteCommand({
    TableName: LOCKER_CACHE_TABLE,
    Key: { lockerBoxId },
  }));
};