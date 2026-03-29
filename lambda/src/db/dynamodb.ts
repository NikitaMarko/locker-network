import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.OPERATIONS_TABLE || 'operations-dynamodb';

export const updateOperationStatus = async (
  operationId: string,
  status: string,
  errorMessage?: string,
) => {
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
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