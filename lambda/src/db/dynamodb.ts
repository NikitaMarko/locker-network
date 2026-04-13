import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const STATION_CACHE_TABLE = process.env.STATION_CACHE_TABLE || 'locker-station-cache';
const LOCKER_CACHE_TABLE = process.env.LOCKER_CACHE_TABLE || 'locker-locker-cache';
const OPERATIONS_TABLE = process.env.OPERATIONS_TABLE || 'locker-dev-operations-dynamodb';


// ─── Operations table ───


export const updateOperationStatus = async (
  operationId: string,
  status: string,
  errorMessage?: string,
) => {
  const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
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

// ─── Station cache ───

export const upsertStationCache = async (stationId: string, payload: Record<string, unknown>, version: number) => {
  // Check existing version to prevent race conditions
  const existing = await docClient.send(new GetCommand({
    TableName: STATION_CACHE_TABLE,
    Key: { stationId },
  }));
 
  if (existing.Item && (existing.Item.version as number) >= version) {
    console.log(`Skipping stale station update: existing=${existing.Item.version}, incoming=${version}`);
    return;
  }
 
  await docClient.send(new PutCommand({
    TableName: STATION_CACHE_TABLE,
    Item: { ...payload, stationId },
  }));
};
 
export const deleteStationCache = async (stationId: string) => {
  await docClient.send(new DeleteCommand({
    TableName: STATION_CACHE_TABLE,
    Key: { stationId },
  }));
};

// ─── Locker cache ───
 
export const upsertLockerCache = async (lockerBoxId: string, payload: Record<string, unknown>, version: number) => {
  const existing = await docClient.send(new GetCommand({
    TableName: LOCKER_CACHE_TABLE,
    Key: { lockerBoxId },
  }));
 
  if (existing.Item && (existing.Item.version as number) >= version) {
    console.log(`Skipping stale locker update: existing=${existing.Item.version}, incoming=${version}`);
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